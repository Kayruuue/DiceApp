import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { IonContent } from '@ionic/angular';
import { Motion } from '@capacitor/motion';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent],
})
export class HomePage implements OnInit, OnDestroy {
  private readonly shakeThreshold = 12;
  private readonly shakeResetThreshold = 6;
  private readonly rollCooldownMs = 800;
  private lastRollAt = 0;
  private shakeArmed = true;
  private accelListener?: PluginListenerHandle;

  readonly rollResult = signal(1);

  roll() {
    const result = Math.floor(Math.random() * 6) + 1;
    this.rollResult.set(result);
  }

  async startMotionDetector() {
    this.accelListener = await Motion.addListener('accel', (event) => {
      const xAcceleration = Math.abs(event.acceleration.x);

      if (xAcceleration < this.shakeResetThreshold) {
        this.shakeArmed = true;
        return;
      }

      const now = Date.now();
      if (
        this.shakeArmed &&
        xAcceleration >= this.shakeThreshold &&
        now - this.lastRollAt >= this.rollCooldownMs
      ) {
        this.shakeArmed = false;
        this.lastRollAt = now;
        this.roll();
      }
    });
  }

  ngOnInit() {
    this.startMotionDetector();
  }

  async ngOnDestroy() {
    await this.accelListener?.remove();
  }
}
