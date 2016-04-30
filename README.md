# LG Hombot/VParquet support for Homey

The LG Hombot/VParquet vacuum cleaner does NOT have network-capabilities by default. However, since it has a USB port, you can upgrade the firmware, load custom firmware and equip it with a Wifi dongle. How to do this is explained here:
- Dutch: http://www.domotica.center/robotstofzuiger-lg-hombot-vparquet/
- German: http://www.roboter-forum.com/showthread.php?10009-LG-Hombot-3-0-(VR6260-VR6270-VR6340)-WLAN-Steuerung-per-Weboberfl%E4che
- English: http://www.roboter-forum.com/showthread.php?10009-LG-Hombot-3-0-%28VR6260-VR6270-VR6340%29-WLAN-Steuerung-per-Weboberfl%E4che&p=107354&viewfull=1#post107354

If you don't do this, you cannot control the vacuum cleaner with Homey using this app.

You need to have the (local) IP-address of your receiver to add the device to Homey (There is no discovery (yet)).

The following cards will be enabled in the flow:
- [ACTION] Start cleaning
- [ACTION] Pause cleaning
- [ACTION] Return to loadingstation.
- [ACTION] Set clean mode (zigzag, spiral spot, cell by cell)
- [ACTION] Set turbo on/off
- [ACTION] Set repeat on/off
- [ACTION] Move forward
- [ACTION] Move backward
- [ACTION] Turn left
- [ACTION] Turn right

- [CONDITION] Is (not) cleaning
- [CONDITION] Is (not) reachable
- [CONDITION] Is (not) heading to docking station
- [CONDITION] Is (not) docking
- [CONDITION] Is (not) charging

Use at your own risk, I accept no responsibility for any damages caused by using this app.

# Changelog
**Version 0.9.5:**
- Added ability to change IP of your Hombot device

**Version 0.9.4:**
- Conditions are now available
- New commands for moving Hombot around, cleaning modes, turbo and repeat.


**Version 0.9.3:**
- Added new commands

**Version 0.9.0:**
- First release