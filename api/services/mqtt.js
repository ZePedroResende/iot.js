import mqtt from "mqtt";
import { startRedis, sensorUp, gatewayUp, updateData } from "./redis.js";

const redisClient = startRedis();

const start = () =>
  mqtt.connect([
    {
      host: process.env.MQTT_HOST,
      port: process.env.MQTT_PORT,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    }
  ]);

const subscribe = client => {
  client.on("connect", () => {
    client.subscribe("gateway/+/status");
    client.subscribe("gateway/+/sensors/+/status");
    client.subscribe("gateway/+/sensors/+");
  });
};

const handlers = client => {
  client.on("message", (topic, message) => {
    switch (true) {
      case /^gateway\/(.*)?\/sensors\/(.*)?\/status$/.test(topic):
        sensor_handler(topic);
        break;
      case /^gateway\/(.*)?\/status$/.test(topic):
        gateway_handler(topic);
        break;
      case /^gateway\/(.*)?\/sensors\/(.*)?$/.test(topic):
        data_handler(topic, message);
        break;
      default:
        break;
    }
  });
};

const gateway_handler = topic => {
  const matches = topic.match(/^gateway\/(.*)?\/status$/);

  sensorUp(redisClient, matches[1]);
};
const sensor_handler = topic => {
  const matches = topic.match(/^gateway\/(.*?)\/sensors\/(.*?)\/status$/);

  gatewayUp(redisClient, matches[1], matches[2]);
};
const data_handler = (topic, data) => {
  const matches = topic.match(/^gateway\/(.*?)\/sensors\/(.*?)$/);

  updateData(redisClient, matches[1], matches[2], data.toString());
};

export const client = () => {
  const client = start();
  subscribe(client);
  handlers(client);
  return client;
};
