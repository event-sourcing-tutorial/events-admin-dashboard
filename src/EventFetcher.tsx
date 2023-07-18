import React from "react";
import {Client, Message} from "./messages";

const fetch_events_cycle = <M extends Message>(client: Client<M>, onChange: (last_index: bigint, events: M[]) => void): (() => void) => {

  let stopping = false;
  let stop_subscription = () => {};

  const events: M[] = [];

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
    console.log("polling ...");
    const stream = client.get_stream({lastIdx: last_index});
    const subscription = stream.subscribe((message) => {
      events.unshift(message);
      events.splice(10);
      last_index = message.idx;
      onChange(message.idx, events);
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
    client.get_last_index()
      .then(({lastIdx}) => {
        const idx = lastIdx - BigInt(10);
        start_polling(idx < BigInt(0) ? BigInt(0) : idx);
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
