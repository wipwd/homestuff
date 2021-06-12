/*
 * home stuff
 * Copyright (C) 2021  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 */
import { Injectable, Logger } from "@nestjs/common";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import fs from "fs";
import os from "os";

@Injectable()
export class InfluxDBService {
  private readonly logger: Logger = new Logger(InfluxDBService.name);
  private readonly org: string = "homestuff";
  private readonly bucket: string = "homestuff";
  private token?: string;
  private client?: InfluxDB = undefined;

  public constructor() {
    this.token = this.getToken();
    if (!this.token) {
      this.logger.error("influxdb not started");
      return;
    }

    this.logger.debug(`using token "${this.token}`);

    this.client = new InfluxDB({
      url: "http://127.0.0.1:8086",
      token: this.token,
    });
  }

  private getToken(): string | undefined {
    const tokenpath: string = `${os.homedir()}/.homestuff/influxdb.token`;
    if (!fs.existsSync(tokenpath)) {
      this.logger.error(`influxdb token not found at "${tokenpath}"`);
      return undefined;
    }

    const tokenstr: string = fs.readFileSync(tokenpath, { encoding: "utf-8" });
    if (tokenstr === "") {
      this.logger.error(`influxdb token empty at "${tokenpath}`);
      return undefined;
    }

    let token: string | undefined = undefined;
    tokenstr.split("\n").forEach((line: string) => {
      if (line !== "") {
        token = line;
      }
    });
    if (token === "") {
      this.logger.error(`malformed influxdb token file at "${tokenpath}`);
      return undefined;
    }
    return token;
  }

  public isStarted(): boolean {
    return !!this.client;
  }

  public getWrite(): WriteApi | undefined {
    if (!this.client) {
      return undefined;
    }
    return this.client.getWriteApi(this.org, this.bucket);
  }
}
