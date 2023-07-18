import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {EventsApisClientImpl, GrpcWebImpl} from '@event-sourcing-tutorial/eventsapis-proto';
import {make_events_client, make_queue_client} from "./messages";

const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const rpc = new GrpcWebImpl(url, {debug: false});
const client = new EventsApisClientImpl(rpc);

client.GetQueue({})
  .then(x => console.log(x))
  .catch(err => console.error(err));

client.GetQueueLastIdx({})
  .then(x => console.log(x))
  .catch(err => console.error(err));

client.GetCommand({commandId: "4f95ebb4-a55b-4c0a-9fc6-a615acdf70fd"})
  .then(x => console.log(x))
  .catch(err => console.error(err));


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App client={client}
      events_client={make_events_client(client)}
      queue_client={make_queue_client(client)}
    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

