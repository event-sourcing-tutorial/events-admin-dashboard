import {EventsApisClientImpl} from "@event-sourcing-tutorial/eventsapis-proto";
import React from "react";

type Event = {
  idx: BigInt,
  payload: any,
};

type Props = {
  client: EventsApisClientImpl,
  render: (events: Event[], error: string | undefined) => React.ReactElement,
};

type State = {
  last_index: BigInt | undefined;
  events: Event[];
  error: string | undefined;
};

const fetch_events_cycle: (client: EventsApisClientImpl, onChange: () => void) => () => void = (client, onChange) => {

  const handle_error: (error: Error, k: () => void) => void = (error, k) => {

  };

  const start_polling: (last_index: bigint) => void = (last_index) => {

    const stream = client.PollEvents({lastIdx: last_index});
    console.log(stream);
    const subscription = stream.subscribe((response) => {
      console.log(response);
    });
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

  };

  fetch_index();
  return stop;
}


export class EventFetcher extends React.Component<Props, State> {
  stop: () => void;
  constructor(props: Props) {
    super(props);
    this.stop = fetch_events_cycle(props.client, () => {});
    this.state = {last_index: undefined, events: [], error: undefined};
  }

  componentDidMount(): void {
  }

  render() {
    return this.props.render(this.state.events, this.state.error);
  }
}
