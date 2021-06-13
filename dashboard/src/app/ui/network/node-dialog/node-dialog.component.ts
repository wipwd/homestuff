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
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ZWNode } from "src/app/shared/models/nodes.model";

@Component({
  selector: "hs-node-dialog",
  templateUrl: "./node-dialog.component.html",
  styleUrls: ["./node-dialog.component.scss"]
})
export class NodeDialogComponent implements OnInit {
  public node: ZWNode;

  public constructor(@Inject(MAT_DIALOG_DATA) public data: { node: ZWNode }) {
    this.node = this.data.node;
  }

  public ngOnInit(): void {
    return;
  }
}
