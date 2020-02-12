import redis from "redis";
export const startRedis = () => {
  const client = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_HOST
  );

  client.on("error", function(err) {
    console.log("Error " + err);
  });

  return client;
};

export const sensorUp = (client, gateway_id, sensor_id) => {
  client.set(`apiary:${gateway_id}/sensor:${sensor_id}:status`, "true");
};
export const gatewayUp = (client, gateway_id) => {
  client.set(`apiary:${gateway_id}:status`, "true");
};

export const updateData = (client, gateway_id, sensor_id, data) => {
  client.set(`apiary:${gateway_id}/sensor:${sensor_id}`, data);
};
