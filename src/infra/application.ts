import express from "express";
import bodyParser from "body-parser";

import {
  handleCrashedService,
  handleTargetAck,
  handleServiceUp,
} from "./commandHandlers";
import { Service } from "../domain/Service";
import { persistService } from "./serviceRepository";

export function startApp(): void {
  const app = express();
  const port = 3000;

  app.use(bodyParser.json());

  app.post("/service", async (req, res) => {
    const service: Service = req.body;
    await persistService(service.id, service);
    res.send({});
  });

  app.post("/service/:id/crashed", async (req, res) => {
    await handleCrashedService(req.params.id);
    res.send({});
  });

  app.post("/service/:id/target_ack", async (req, res) => {
    await handleTargetAck(req.params.id);
    res.send({});
  });

  app.post("/service/:id/up", async (req, res) => {
    await handleServiceUp(req.params.id);
    res.send({});
  });

  app.listen(port, () => console.log(`Listening on port ${port}!`));
}
