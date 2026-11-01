'use strict';

function screenKey(screen) {
 return [screen.label, screen.left, screen.top, screen.width, screen.height].join('|');
}

function chooseScreen(details, selection = 'auto') {
 if (!details) return null;
 const screens = Array.from(details.screens);
 if (selection !== 'auto') {
  const selected = screens.find(screen => screenKey(screen) === selection);
  if (selected) return selected;
 }
 return screens.find(screen => screen !== details.currentScreen && !screen.isInternal)
  || screens.find(screen => screen !== details.currentScreen)
  || details.currentScreen;
}

function popupFeatures(screen) {
 if (!screen) return 'popup,width=1280,height=720';
 return `popup,left=${screen.availLeft},top=${screen.availTop},width=${screen.availWidth},height=${screen.availHeight}`;
}

class PresentationController {
 constructor({save, changeLayout}, browser = window) {
  this.browser = browser;
  this.save = save;
  this.changeLayout = changeLayout;
  this.output = null;
  this.details = null;
  this.launching = false;
  this.$ = id => browser.document.getElementById(id);
  this.refreshScreens = () => this.listScreens();
  this.$('detect-screens').onclick = () => this.detectScreens();
  this.$('launch').onclick = () => this.launch();
  this.$('close-output').onclick = () => this.close();
  this.$('focus-output').onclick = () => this.output?.focus();
  for (const active of [1, 2]) this.$('live-' + active).onclick = async () => {
   try { await this.changeLayout(active); }
   catch (error) { this.status(error.message); }
  };
  this.timer = browser.setInterval(() => this.syncWindow(), 500);
 }

 status(text) { this.$('screen-status').textContent = text; }

 async init() {
  if (typeof this.browser.getScreenDetails !== 'function') {
   this.$('detect-screens').disabled = true;
   this.status('Skjermvalg støttes ikke her. Visningen åpnes i et eget vindu som du kan flytte manuelt.');
   return;
  }
  try {
   const permission = await this.browser.navigator.permissions.query({name:'window-management'});
   if (permission.state === 'granted') await this.detectScreens();
  } catch { /* Manuell skjermdeteksjon fungerer også uten Permissions API. */ }
 }

 async detectScreens() {
  this.$('detect-screens').disabled = true;
  try {
   const details = await this.browser.getScreenDetails();
   this.details?.removeEventListener('screenschange', this.refreshScreens);
   this.details?.removeEventListener('currentscreenchange', this.refreshScreens);
   this.details = details;
   details.addEventListener('screenschange', this.refreshScreens);
   details.addEventListener('currentscreenchange', this.refreshScreens);
   this.listScreens();
  } catch {
   this.details?.removeEventListener('screenschange', this.refreshScreens);
   this.details?.removeEventListener('currentscreenchange', this.refreshScreens);
   this.details = null;
   this.$('display-screen').replaceChildren(new this.browser.Option('Automatisk · denne skjermen', 'auto'));
   this.status('Ingen tilgang til skjermlisten. Tillat skjermtilgang i nettleseren, eller flytt visningsvinduet manuelt.');
  } finally { this.$('detect-screens').disabled = false; }
 }

 listScreens() {
  const select = this.$('display-screen');
  const previous = select.value;
  const screens = Array.from(this.details.screens);
  const target = chooseScreen(this.details);
  const label = target?.label || 'denne skjermen';
  select.replaceChildren(new this.browser.Option('Automatisk · ' + label, 'auto'));
  screens.forEach((screen, index) => {
   const tags = [screen.isInternal ? 'innebygd' : 'ekstern', screen === this.details.currentScreen ? 'kontrollpanel' : ''].filter(Boolean);
   const text = `${screen.label || 'Skjerm ' + (index + 1)} · ${screen.width} × ${screen.height} (${tags.join(', ')})`;
   select.add(new this.browser.Option(text, screenKey(screen)));
  });
  const disconnected = previous && previous !== 'auto' && !screens.some(screen => screenKey(screen) === previous);
  select.value = disconnected ? 'auto' : previous || 'auto';
  this.status(disconnected
   ? 'Den valgte skjermen er koblet fra. Neste Launch bruker automatisk skjermvalg. En aktiv visning flyttes ikke av appen.'
   : `${screens.length} skjerm${screens.length === 1 ? '' : 'er'} funnet. Automatisk foretrekker en ekstern skjerm uten kontrollpanelet.`);
 }

 syncWindow() {
  if (this.output?.closed) this.output = null;
  const running = Boolean(this.output);
  for (const id of ['close-output','focus-output','live-1','live-2']) this.$(id).disabled = !running || this.launching;
 }

 async launch() {
  if (this.launching) return;
  this.launching = true;
  this.$('launch').disabled = true;
  // Åpne før første await, mens klikket fortsatt tillater et nytt vindu.
  let opened = null;
  try {
   const target = chooseScreen(this.details, this.$('display-screen').value);
   if (this.output && !this.output.closed) {
    this.status('Visningen er allerede åpen. Lukk den før du bytter visningsskjerm.');
    return;
   }
   opened = this.browser.open('about:blank', 'VikingViewerOutput', popupFeatures(target));
   if (!opened) {
    this.status('Nettleseren blokkerte visningsvinduet. Tillat popup-vinduer for denne siden og trykk Launch igjen.');
    return;
   }
   this.output = opened;
   opened.document.title = 'VikingViewer · Klargjør visning';
   opened.document.body.textContent = 'Klargjør visning …';
   if (!await this.save()) {
    opened.close();
    this.output = null;
    this.status('Visningen ble ikke startet. Rett innstillingene og prøv igjen.');
    return;
   }
   if (opened.closed) { this.output = null; return; }
   opened.location.replace('/view?presentation=1');
   this.status('Visningen er åpen. Hvis fullskjerm ikke starter automatisk, klikk «Start fullskjerm» i visningsvinduet. Lukk visning her når du er ferdig.');
  } catch {
   if (opened && !opened.closed) opened.close();
   this.output = null;
   this.status('Kunne ikke åpne visningen. Kontroller nettlesertillatelser og prøv igjen.');
  } finally {
   this.launching = false;
   this.$('launch').disabled = false;
   this.syncWindow();
  }
 }

 close() {
  if (this.output && !this.output.closed) this.output.close();
  this.output = null;
  this.syncWindow();
  this.status('Visningen er lukket. Kontrollpanelet er klart.');
 }
}

if (typeof module !== 'undefined' && module.exports) module.exports = {screenKey, chooseScreen, popupFeatures, PresentationController};
