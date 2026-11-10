import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(readonly page: Page) {}
  get heading() { return this.page.getByRole('heading', { name: 'Login', exact: true }); }
  get username() { return this.page.getByPlaceholder('Username', { exact: true }); }
  get password() { return this.page.getByPlaceholder('Password', { exact: true }); }
  get submitButton() { return this.page.getByRole('button', { name: 'Login', exact: true }); }
  get rejection() { return this.page.getByRole('alert'); }
  get requiredMessages() { return this.page.getByText('Required', { exact: true }); }

  async open() { await this.page.goto('/web/index.php/auth/login'); }
  async signIn(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }
  async submitEmpty() { await this.submitButton.click(); }
}
