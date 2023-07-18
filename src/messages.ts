import {commandStatus, EventsApisClientImpl} from "@event-sourcing-tutorial/eventsapis-proto";

export type Subscription = {
  add: (handler: () => void) => void;
  unsubscribe: () => void;
};

export type Observable<M> = {
  subscribe: (onmessage: (m: M, idx: bigint) => void, onerror: (e: Error) => void, ondone: () => void) => Subscription,
};

export type Client<M> = {
  get_intial_state: () => Promise<{lastIdx: bigint, messages: M[]}>;
  get_stream: (args: {lastIdx: bigint}) => Observable<M>,
};

export type Message = {
};

export type Event = {
  idx: bigint,
  inserted: Date,
  payload: any,
};

export const make_events_client: (client: EventsApisClientImpl) => Client<Event> = (client) => ({
  get_intial_state: () => 
    client.GetEventLastIdx({})
      .then(({lastIdx}) => {
        const idx = lastIdx - BigInt(10);
        return {
          lastIdx: idx > BigInt(0) ? idx : BigInt(0),
          messages: []
        };
      }),
  get_stream: ({lastIdx}) => {
    const stream = client.PollEvents({lastIdx});
    return {
      subscribe: (onmessage, onerror, ondone) => {
        return stream.subscribe(({idx, inserted, payload}) => {
            if (!inserted) throw new Error("missing inserted field");
            onmessage({idx, inserted, payload}, idx);
        }, onerror, ondone);
      }
    };
  },
});

export type QueueCommand = {
  idx: bigint,
  command_id: string,
  command_type: string,
  command_data: any,
  status: "issued" | "finalized",
  updated: Date,

};

export const make_queue_client: (client: EventsApisClientImpl) => Client<QueueCommand> = (client) => ({
  get_intial_state: () => 
    client.GetQueueLastIdx({})
      .then(({lastIdx}) =>
        client.GetQueue({})
          .then(({entries}) => {
            console.log(entries);
            return {
              lastIdx,
              messages: entries.map(({commandId, commandType, commandData, inserted}) => {
                if (!inserted) throw new Error("missing inserted field");
                return {
                  idx: BigInt(0),
                  command_id: commandId,
                  command_type: commandType,
                  command_data: commandData,
                  status: "issued",
                  updated: inserted,
                  
                };
              }),
            };
          })),
  get_stream: ({lastIdx}) => {
    const stream = client.PollCommands({lastIdx});
    return {
      subscribe: (onmessage, onerror, ondone) => {
        return stream.subscribe(({idx, commandId, status, updated}) => {
            if (!updated) throw new Error("missing updated field");
            onmessage({
              idx,
              command_id: commandId,
              command_type: "unknown",
              command_data: "unknown",
              status: (() => {
                switch (status) {
                  case commandStatus.ISSUED: return "issued";
                  case commandStatus.FINALIZED: return "finalized";
                  default: throw new Error(`invalid status: ${status}`);
                }
              })(),
              updated,
            },
            idx);
        }, onerror, ondone);
      }
    };
  },
});
