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
import { Injectable, Logger } from '@nestjs/common';
import ZWave from "openzwave-shared";
import fs from "fs";
import os from "os";

@Injectable()
export class ZwaveService {

  private readonly logger: Logger = new Logger(ZwaveService.name);
  private readonly BASEPATH: string = `${os.homedir()}/.homestuff`;
  private _zwave: ZWave;
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

    this._zwave = new ZWave({
      UserPath: zwavedir,
      ConsoleOutput: false,
      LogFileName: "homestuff.zwave.log",
      Logging: true
    });

    this._zwave.on("connected", this.onConnected.bind(this));
    this._zwave.on("driver failed", this.onFailed.bind(this));
    this._zwave.on("driver ready", this.onReady.bind(this));
    this._zwave.on("manufacturer specific DB ready",
                  this.onDBReady.bind(this));
    this._zwave.on("scan complete", this.onScanCompleted.bind(this));
  }

  private onConnected(version: string): void {
    this.logger.debug("zwave driver connected");
    this._is_connected = true;
    this._is_failed = false;
  }

  private onFailed(): void {
    this.logger.debug("zwave driver failed");
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

  private onDBReady(): void {
    this.logger.debug("zwave manufacturer db ready");
    this._is_db_ready = true;
  }

  private onScanCompleted(): void {
    this.logger.debug("zwave driver scan completed");
    this._is_scan_complete = true;
  }

  private deviceExists(devicestr: string): boolean {
    return !!devicestr && devicestr !== "" && fs.existsSync(devicestr);
  }

  private findCandidateDevices(): string[] {
    const devlst = fs.readdirSync("/dev", {encoding: "utf-8"});
    const candidates: string[] = [];
    devlst.forEach((dev: string) => {
      if (dev.startsWith("ttyACM") || dev.startsWith("ttyUSB")) {
        candidates.push("/dev/" + dev);
      }
    });
    return candidates;
  }

  public get driver(): ZWave {
    return this._zwave;
  }

  public get device(): string {
    return this._device;
  }

  public set device(devicestr: string) {
    if (this.deviceExists(devicestr)) {
      this._device = devicestr;
    } else {
      this.logger.error(`device ${devicestr} does not exist`);
    }
  }

  public get candidateDevices(): string[] {
    return this.findCandidateDevices();
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
    return (this.isConnected() && this.isReady() &&
            this.isDBReady() && this.isScanComplete());
  }

  public start(): boolean {
    this.logger.log("start zwave driver");
    if (this.isConnected()) {
      this.logger.debug("attempted to start a connected network");
      return true;
    }

    let devicestr: string|undefined = this._device;
    if (!devicestr || devicestr === "") {
      const candidates = this.findCandidateDevices();
      if (candidates.length == 0) {
        this.logger.error("unable to find candidate device to start driver");
        return false;
      }
      devicestr = candidates[0];
      this._device = devicestr;
      this.logger.log(`candidate device: ${this._device}`)
    }

    this._zwave.connect(this._device);
    return true;
  }

  public stop(): boolean {
    this.logger.log("stop zwave driver");
    if (!this.isConnected()) {
      return true;
    }
    this._zwave.disconnect(this._device);
    this._is_connected = false;
    this._is_failed = false;
    this._is_ready = false;
    this._is_db_ready = false;
    this._is_scan_complete = false;
    return true;
  }
}
