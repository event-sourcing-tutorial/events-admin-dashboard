import {EventsApisClientImpl} from "@event-sourcing-tutorial/eventsapis-proto";

export type Subscription = {
  add: (handler: () => void) => void;
  unsubscribe: () => void;
};

export type Observable<M> = {
  subscribe: (onmessage: (m: M) => void, onerror: (e: Error) => void, ondone: () => void) => Subscription,
};

export type Client<M> = {
  get_last_index: () => Promise<{lastIdx: bigint}>;
  get_stream: (args: {lastIdx: bigint}) => Observable<M>,
};

export type Message = {
  idx: bigint,
};

export type Event = {
  idx: bigint,
  inserted: Date,
  payload: any,
};

export const make_events_client: (client: EventsApisClientImpl) => Client<Event> = (client) => ({
  get_last_index: () => client.GetEventLastIdx({}),
  get_stream: ({lastIdx}) => {
    const stream = client.PollEvents({lastIdx});
    return {
      subscribe: (onmessage, onerror, ondone) => {
        return stream.subscribe(({idx, inserted, payload}) => {
            if (!inserted) throw new Error("missing inserted field");
            onmessage({
              idx, 
              inserted,
              payload,
            });
        }, onerror, ondone);
      }
    };
  },
});
