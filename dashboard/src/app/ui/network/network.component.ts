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
import { Component, OnInit } from "@angular/core";
import { ZWNode } from "src/app/shared/models/nodes.model";

import { NodesService } from "../../shared/services/api/nodes.service";

@Component({
  selector: "hs-network",
  templateUrl: "./network.component.html",
  styleUrls: ["./network.component.scss"]
})
export class NetworkComponent implements OnInit {
  public nodes: ZWNode[] = [];
  public hoverIdx: number = -1;

  public constructor(private nodesService: NodesService) {
    this.nodesService.getNodes().subscribe({
      next: (nodes: ZWNode[]) => {
        this.nodes = nodes;
      }
    });
  }

  public ngOnInit(): void {
    return;
  }

  public onClick(idx: number): void {
    console.log("clicked idx = ", idx);
  }

  public onMouseHover(idx: number): void {
    this.hoverIdx = idx;
  }

  public onMouseLeave(idx: number): void {
    this.hoverIdx = -1;
  }
}
