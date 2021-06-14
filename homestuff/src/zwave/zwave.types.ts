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

import { ApiProperty } from "@nestjs/swagger";
import { NodeStatus, NodeType, ZWavePlusRoleType } from "zwave-js";

/**
 * Represents a device's capabilities
 */
export class ZWNodeCaps {
  @ApiProperty({ description: "device is able to listen" })
  isListening: boolean;

  @ApiProperty({ description: "device is frequently listens" })
  isFrequentListening: boolean;

  @ApiProperty({ description: "device is able to route messages" })
  isRouting: boolean;

  @ApiProperty({ description: "device is secure" })
  isSecure: boolean;

  @ApiProperty({ description: "device can sleep; should be assumed as such" })
  canSleep: boolean;

  @ApiProperty({ description: "device is able to beam" })
  isBeaming: boolean;
}

/**
 * Representation of a zwave network node. Coallesces information from
 * zwave-js's node class in a json-serializable format.
 */
export class ZWNode {
  @ApiProperty({ description: "node id" })
  id: number;

  @ApiProperty({ description: "device vendor name" })
  vendor: string;

  @ApiProperty({ description: "device model name" })
  model: string;

  @ApiProperty({ description: "device description" })
  desc: string;

  @ApiProperty({ description: "whether the device is ready" })
  ready: boolean;

  @ApiProperty({
    description: "device status",
    enum: ["Unknown", "Asleep", "Awake", "Dead", "Alive"],
  })
  status: NodeStatus;

  @ApiProperty({
    description: "device type",
    enum: ["Controller", "Routing End Node"],
  })
  type: NodeType;

  @ApiProperty({ description: "device capabilities" })
  caps: ZWNodeCaps;

  @ApiProperty({
    description: "device zwave+ role",
    enum: [
      "Central Static Controller",
      "SubStatic Controller",
      "Portable Controller",
      "Portable Reporting Controller",
      "Portable Slave",
      "Always On Slave",
      "Sleeping Reporting Slave",
      "Sleeping Listening Slave",
    ],
  })
  role?: ZWavePlusRoleType;
}
