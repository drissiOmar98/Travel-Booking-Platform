import {Component, input} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    FaIconComponent,
    NgClass
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {

  // Reactive input signal that holds the avatar's image URL.
  // The parent component can provide this input, and it will update reactively.
  imageUrl = input<string>();

  // Reactive input signal that controls the avatar's size.
  // It accepts either "avatar-sm" or "avatar-xl" and updates reactively.
  avatarSize = input<"avatar-sm" | "avatar-xl">();


}
