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
import { Driver } from "zwave-js";
import fs from "fs";
import os from "os";

@Injectable()
export class ZwaveService {
  private readonly logger: Logger = new Logger(ZwaveService.name);
  private readonly BASEPATH: string = `${os.homedir()}/.homestuff`;
  private driver: Driver;
  private _device?: string;
  private _is_connected: boolean = false;
  private _is_failed: boolean = false;
  private _is_ready: boolean = false;
  private _is_db_ready: boolean = false;
  private _is_scan_complete: boolean = false;

  public constructor() {
    this.logger.log("creating zwave service");

    if (!fs.existsSync(this.BASEPATH)) {
      fs.mkdirSync(this.BASEPATH);
    }

    const zwavedir: string = `${this.BASEPATH}/zwave.db`;
    if (!fs.existsSync(zwavedir)) {
      fs.mkdirSync(zwavedir);
    }

    const device = this.getCandidateDevice();
    if (!device) {
      this.logger.error("unable to find candidate device");
      throw new Error("no candidate device for zwave driver");
    }

    if (!fs.existsSync(device)) {
      this.logger.error(`selected device '${device}' does not exist`);
      throw new Error("zwave candidate device does not exist: " + device);
    }

    this.driver = new Driver(device, {
      logConfig: {
        logToFile: true,
        filename: `${this.BASEPATH}/zwavejs`,
      },
    });

    this.driver.on("error", this.onError.bind(this));
    this.driver.once("driver ready", this.onReady.bind(this));
    this.driver.once("all nodes ready", this.onScanCompleted.bind(this));
  }

  private onError(error): void {
    this.logger.debug("zwave driver failed: " + error);
    this._is_connected = false;
    this._is_failed = true;
    this._is_ready = false;
  }

  private onReady(id: number): void {
    this.logger.debug(`zwave driver ready, home id: ${id}`);
    this._is_connected = true;
    this._is_failed = false;
    this._is_ready = true;
  }

  private onScanCompleted(): void {
    this.logger.debug("zwave driver scan completed");
    this._is_scan_complete = true;
  }

  private deviceExists(devicestr: string): boolean {
    return !!devicestr && devicestr !== "" && fs.existsSync(devicestr);
  }

  private findCandidateDevices(): string[] {
    const devlst = fs.readdirSync("/dev", { encoding: "utf-8" });
    const candidates: string[] = [];
    devlst.forEach((dev: string) => {
      if (dev.startsWith("ttyACM") || dev.startsWith("ttyUSB")) {
        candidates.push("/dev/" + dev);
      }
    });
    return candidates;
  }

  private getCandidateDevice(): string | undefined {
    const candidates: string[] = this.findCandidateDevices();
    if (candidates.length === 0) {
      return undefined;
    }
    return candidates[0];
  }

  public getDriver(): Driver {
    return this.driver;
  }

  public isConnected(): boolean {
    return this._is_connected;
  }

  public isFailed(): boolean {
    return this._is_failed;
  }

  public isReady(): boolean {
    return this._is_ready;
  }

  public isDBReady(): boolean {
    return this._is_db_ready;
  }

  public isScanComplete(): boolean {
    return this._is_scan_complete;
  }

  public isDriverReady(): boolean {
    return (
      this.isConnected() &&
      this.isReady() &&
      this.isDBReady() &&
      this.isScanComplete()
    );
  }

  public async start(): Promise<boolean> {
    this.logger.log("start zwave driver");
    if (this.isConnected()) {
      this.logger.debug("attempted to start a connected network");
      return false;
    }

    await this.driver.start();
    return true;
  }

  public stop(): boolean {
    this.logger.log("stop zwave driver");
    if (!this.isConnected()) {
      return true;
    }
    this.driver.destroy();
    this._is_connected = false;
    this._is_failed = false;
    this._is_ready = false;
    this._is_db_ready = false;
    this._is_scan_complete = false;
    return true;
  }
}
