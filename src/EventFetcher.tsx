import React from "react";
import {Client, Message} from "./messages";

const fetch_events_cycle = <M extends Message>(client: Client<M>, onChange: (last_index: bigint, events: M[]) => void): (() => void) => {

  let stopping = false;
  let stop_subscription = () => {};

  let events: M[] = [];

  const handle_error: (error: Error, k: () => void) => void = (error, k) => {
    if (stopping) {
      return;
    }
    const th = setTimeout(() => {
      stop_subscription = () => {};
      k();
    }, 1000);
    stop_subscription = () => {
      clearTimeout(th);
    };
  };

  const start_polling: (last_index: bigint) => void = (last_index) => {
    console.log(`polling ... ${last_index}`);
    const stream = client.get_stream({lastIdx: last_index});
    const subscription = stream.subscribe((message, idx) => {
      events = client.reduce(events, message);
      last_index = idx;
      onChange(idx, events);
    },
    (error) => {
        console.error("ERROR", error);
    },
    () => {
        console.log("DONE?");
    });
    subscription.add(() => {
      if (!stopping) {
        start_polling(last_index);
      }
    });
    stop_subscription = () => subscription.unsubscribe();
  };

  const fetch_index: () => void = () => {
    client.get_intial_state()
      .then(({lastIdx, messages}) => {
        events = messages;
        onChange(lastIdx, messages);
        start_polling(lastIdx);
      })
      .catch(error => {
        handle_error(error, fetch_index);
      });
  };

  const stop: () => void = () => {
    stopping = true;
    stop_subscription();
  };

  fetch_index();

  return stop;
}

type Props<M> = {
  client: Client<M>,
  render: (events: M[], error: string | undefined) => React.ReactElement,
};

type State<M> = {
  last_index: BigInt | undefined;
  events: M[];
  error: string | undefined;
};


export class EventFetcher<M extends Message> extends React.Component<Props<M>, State<M>> {
  stop: () => void = () => {};
  constructor(props: Props<M>) {
    super(props);
    this.state = {last_index: undefined, events: [], error: undefined};
  }

  componentDidMount(): void {
    this.stop = fetch_events_cycle(this.props.client, (last_index, events) => {
      this.setState(() => ({last_index, events, error: undefined}));
    });
  }

  componentWillUnmount(): void {
    this.stop();
  }

  render() {
    return this.props.render(this.state.events, this.state.error);
  }
}
