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

/*
 * From openzwave-shared
 * LICENSE: ISC
 * SOURCE: https://github.com/OpenZWave/node-openzwave-shared
 *
 * Copyright (c) 2013 Jonathan Perkin <jonathan@perkin.org.uk>
 * Copyright (c) 2015-2017 Elias Karakoulakis <elias.karakoulakis@gmail.com>
 */
export interface NodeInfo {
  manufacturer: string;
  manufacturerid: string;
  product: string;
  producttype: string;
  productid: string;
  type: string;
  name: string;
  loc: string;
}
/* END OF openzwave-shared */

export enum ZWNodeStateEnum {
  none = 0,
  alive = 1,
  awake = 2,
  dead = 3,
  sleep = 4
}

export interface ZWNode {
  id: number;
  info?: NodeInfo;
  available: boolean;
  ready: boolean;
  state: ZWNodeStateEnum;
  removed: boolean;
}
