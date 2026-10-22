import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/terminos/', '/politica-de-privacidad/', '/arrepentimiento/', '/gracias/'];

// La API de IA integrada de Chromium puede quejarse si su servicio no corre:
// no es un error del sitio (el asistente cae al motor local).
const IGNORAR = [/text session/i, /dolarapi/i, /net::ERR/i];

const vigilarConsola = (page: Page) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORAR.some((r) => r.test(m.text()))) errores.push(m.text());
  });
  return errores;
};

for (const path of PAGES) {
  test(`${path} carga sin errores ni violaciones de CSP`, async ({ page }) => {
    const errores = vigilarConsola(page);
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Matecito Tech/);
    expect(errores).toEqual([]);
  });

  test(`${path} pasa axe (WCAG 2.2 AA)`, async ({ page }) => {
    await page.goto(path);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}

test('SEO: título, canónica, JSON-LD y marca', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Matecito Tech/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://matecito.qzz.io/');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
  const tipos = ld['@graph'].map((n: { '@type': string | string[] }) => [n['@type']].flat()).flat();
  for (const t of ['Organization', 'WebSite', 'WebPage', 'FAQPage', 'OfferCatalog']) expect(tipos).toContain(t);
  await expect(page.locator('h1')).toContainText('Software a medida');
});

test('el formulario valida antes de enviar', async ({ page }) => {
  await page.goto('/#contacto');
  await page.getByRole('button', { name: 'Enviar consulta' }).click();
  await expect(page.locator('#nombre')).toHaveAttribute('aria-invalid', 'true');
});

test('el asistente responde y arma el mensaje de WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.locator('#precios').scrollIntoViewIfNeeded();
  await page.locator('[data-chat-open]:visible').first().click();
  await page.getByLabel('Escribí tu pregunta').fill('Tengo una ferretería y quiero vender online');
  await page.keyboard.press('Enter');
  await expect(page.locator('.msg--bot').last()).toContainText('tienda online', { ignoreCase: true });
  await expect(page.locator('.msg__actions a[href*="wa.me/543425370985"]').last()).toBeVisible();
});

test('la ronda de mate suma logros', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Cebarle un mate al gaucho/ }).click();
  await expect(page.locator('[data-ronda-count]')).toHaveText('1/5');
});

test('tema oscuro persiste', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('el botón de arrepentimiento está en la primera pantalla (Res. 424/2020)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.dock__legal, .hero__legal a').filter({ visible: true }).first()).toBeInViewport();
});

test('el gaucho reacciona al mouse (parallax + inclinación 3D)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'en celular el parallax usa giroscopio y scroll');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.mouse.move(200, 200);
  for (let i = 0; i < 15; i++) await page.mouse.move(300 + i * 60, 250 + i * 20);
  await expect.poll(() => page.locator('#gaucho').evaluate((el) => (el as HTMLElement).style.transform)).toContain('rotateY');
  await expect.poll(() => page.locator('.hero__field--dia').evaluate((el) => (el as HTMLElement).style.translate)).not.toBe('');
});

test('las secciones aparecen al entrar en pantalla', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const titulo = page.locator('#precios .reveal').first();
  await titulo.scrollIntoViewIfNeeded();
  await expect(titulo).toHaveClass(/is-in/);
});

test('el formulario de contacto envía al Worker y confirma', async ({ page }) => {
  let enviado: Record<string, string> | null = null;
  await page.route('**/api/contacto', async (route) => {
    enviado = JSON.parse(route.request().postData() ?? '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/#contacto');
  await page.fill('#nombre', 'Laura Gómez');
  await page.fill('#contacto_dato', 'laura@example.com');
  await page.fill('#mensaje', 'Quiero una tienda online para mi ferretería.');
  await page.getByRole('button', { name: 'Enviar consulta' }).click();
  await expect(page.locator('#form-status')).toContainText('Recibimos tu consulta');
  expect(enviado).toMatchObject({ nombre: 'Laura Gómez', contacto: 'laura@example.com' });
});

test('el arrepentimiento muestra el código de identificación (Res. 424/2020)', async ({ page }) => {
  await page.goto('/gracias/?tramite=Arrepentimiento&codigo=ARR-20261022-ABC123');
  await expect(page.locator('[data-codigo]')).toHaveText('ARR-20261022-ABC123');
  await expect(page.locator('h1')).toContainText('arrepentimiento');
});
