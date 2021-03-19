function openPage() {
    runtime.openOptionsPage()
}

browser.browserAction.onClicked.addListener(openPage);
