import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EcoUser } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<EcoUser | null>(null);
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  /** True once we've checked the backend session at least once (see authGuard + AppComponent). */
  readonly initialized = this._initialized.asReadonly();

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Full-page redirect into the Google OAuth handshake. This can't be a
   * plain HTTP call — Google needs a real browser navigation. The backend
   * sets an httpOnly cookie and redirects back to /dashboard when done.
   */
  signInWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  /**
   * Asks the backend "is there a valid session cookie right now?". Call
   * this once on app bootstrap (AppComponent) and it's safe to call again
   * from the auth guard — it's a no-op after the first successful check
   * unless you pass force=true (e.g. right after logging out elsewhere).
   */
  async checkSession(force = false): Promise<void> {
    if (this._initialized() && !force) return;

    try {
      const res = await firstValueFrom(
        this.http.get<{ user: EcoUser }>(`${this.apiUrl}/me`, { withCredentials: true })
      );
      this._user.set(res.user);
    } catch {
      this._user.set(null);
    } finally {
      this._initialized.set(true);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }));
    } finally {
      this._user.set(null);
    }
  }

  async updateUnitPreference(pref: 'kg' | 'lbs'): Promise<void> {
    const res = await firstValueFrom(
      this.http.patch<{ user: EcoUser }>(`${this.apiUrl}/me`, { unitPreference: pref }, { withCredentials: true })
    );
    this._user.set(res.user);
  }

  isLoggedIn(): boolean {
    return !!this._user();
  }
}
