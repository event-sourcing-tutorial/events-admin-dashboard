import {EventsApisClientImpl} from "@event-sourcing-tutorial/eventsapis-proto";
import React from "react";

type Event = {
  idx: BigInt,
  inserted: Date,
  payload: any,
};

const fetch_events_cycle: (client: EventsApisClientImpl, onChange: (last_index: bigint, events: Event[]) => void) => () => void = (client, onChange) => {

  let stopping = false;
  let stop_subscription = () => {};

  const events: Event[] = [];

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
    const stream = client.PollEvents({lastIdx: last_index});
    const subscription = stream.subscribe(({idx, inserted, payload}) => {
      if (!inserted) throw new Error("missing inserted date");
      events.unshift({idx, inserted, payload});
      events.splice(10);
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
    client.GetLastIdx({})
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

type Props = {
  client: EventsApisClientImpl,
  render: (events: Event[], error: string | undefined) => React.ReactElement,
};

type State = {
  last_index: BigInt | undefined;
  events: Event[];
  error: string | undefined;
};


export class EventFetcher extends React.Component<Props, State> {
  stop: () => void = () => {};
  constructor(props: Props) {
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
