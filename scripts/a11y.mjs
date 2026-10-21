#!/usr/bin/env bun
/** Audit rápido de axe sobre la home en light mode 1440px. */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const results = await new AxeBuilder(page).withTags(['wcag2aa', 'color-contrast']).analyze();
  const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
  
  console.log('Color-contrast violations: ' + contrastViolations.length);
  contrastViolations.forEach(v => {
    console.log('- [' + v.severity + '] ' + v.id + ': ' + v.description);
    if (v.details && v.details.items) {
      v.details.items.forEach(function(item) {
        var sel = item.node ? item.node.selector : (item.relatedNode ? item.relatedNode.selector : 'N/A');
        console.log('  ' + sel + ': ' + (item.explanation || ''));
      });
    }
  });

  console.log('Total violations: ' + results.violations.length);
  await browser.close();
})();