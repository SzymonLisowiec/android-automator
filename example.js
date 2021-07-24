const { AndroidAutomator } = require('./');

(async () => {
  const device = new AndroidAutomator({
    deviceSerial: 'emulator-5554',
    dumpFilePath: `${__dirname}/window.xml`,
  });

  const batteryLevel = await device.getBatteryLevel();
  console.log(`Current battery level: ${batteryLevel}%`);
  
  // Refresh device view
  await device.refresh();
  // Swipe up to show menu
  await device.sendInput('swipe', '300 1000 300 200');
  
  // Tap Settings icon
  await device.tapBySelector('node[text="Settings"]');
})();
