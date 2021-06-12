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
import {
  AfterContentInit,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  OnInit
} from "@angular/core";

@Component({
  selector: "hs-sidenav-item-icon",
  template: "<ng-content></ng-content>"
})
export class SidenavItemIconComponent implements OnInit {
  public icon?: string;

  public constructor(private elementRef: ElementRef<HTMLElement>) {}

  public ngOnInit(): void {
    const elem: HTMLElement = this.elementRef.nativeElement;
    this.icon = elem.innerText;
  }
}

@Directive({
  selector: "[hsSidenavItemTitle], hs-sidenav-item-title"
})
export class SidenavItemTitleDirective {
  public constructor() {}
}

@Component({
  selector: "hs-sidenav-item",
  templateUrl: "./sidenav-item.component.html",
  styleUrls: ["./sidenav-item.component.scss"]
})
export class SidenavItemComponent implements AfterContentInit {
  // things we'll be showing

  public icon: string = "";

  @ContentChild(SidenavItemIconComponent)
  public child_icon!: SidenavItemIconComponent;

  @ContentChild(SidenavItemTitleDirective)
  public title!: SidenavItemTitleDirective;

  @Input()
  public routerLink: string = "";

  public constructor() {}

  public ngAfterContentInit(): void {
    if (!!this.child_icon.icon) {
      this.icon = this.child_icon.icon;
    }
  }
}
