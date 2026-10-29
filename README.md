# Samsung Oven Card for Home Assistant

A custom Lovelace card for Home Assistant designed specifically for Samsung smart ovens integrated via [LocalThings](https://github.com/LocalThings) (local SmartThings integration).

It provides an appliance-focused interface featuring real-time cooking mode graphics, an animated circular progress ring, remaining time countdown, dynamic temperature/wattage displays, and quick-toggle controls.

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Lovelace-blue.svg)
![Status](https://img.shields.io/badge/Status-Beta-orange.svg)

---

## Features

- **Dynamic Cooking Mode Icon**: Displays custom SVG oven icons representing the current cooking mode (Convection, Grill, Microwave, Air Fryer, Defrost, Steam Clean, and more).
- **Circular Progress Gauge**: An animated gauge ring tracking cooking progress percentage, leaving an opening at the bottom for status.
- **Live Remaining Time Countdown**: Displays the time remaining computed from `estimated_finish` and counts down every second in real time.
- **Temperature & Wattage Monitoring**:
  - Large current temperature readout with the target temperature shown beneath.
  - **Dynamic status colors**: **Blue** when warming up, **Red** when cooling down, and **Green** when within target temperature.
  - **Animated trend arrows**: Upward pulsing arrow when heating up; downward pulsing arrow when cooling down to reach target.
  - **Microwave mode detection**: Automatically switches from temperature to current microwave wattage (e.g. `900 W`).
- **Interactive Cooking Mode Selector**: Built-in dropdown to easily view and switch cooking modes directly from the card.
- **Bottom Status & Control Bar**:
  - Status indicators for **Smart Control**, **Child Lock**, and **Door** (open/closed).
  - One-click toggles for **Oven Light (Lamp)** and **Sound**.
- **Visual Card Editor**: Graphical configuration dialog that automatically discovers and filters LocalThings Samsung oven devices.

---

## Installation

> [!NOTE]
> This card is not yet published in the default HACS repository or the Home Assistant Community Store, but publication is planned for the future. In the meantime, you can install it manually or as a custom repository.

### Manual Installation

1. Download the files inside the [`src/`](./src/) directory of this repository:
   - `samsung-oven-card.js`
   - `samsung-oven-card-editor.js`
   - `consts.js`
   - `styles.js`
   - `oven-icons.js`
   - `helpers/inputs.js`

2. Copy the files into your Home Assistant configuration directory under:

   ```text
   config/www/samsung-oven-card/
   ```

3. Add the card as a Dashboard resource:
   - In Home Assistant, navigate to **Settings > Dashboards > Three Dots (top right) > Resources**.
   - Click **Add Resource**.
   - Set **URL** to:
     ```text
     /local/samsung-oven-card/samsung-oven-card.js
     ```
   - Set **Resource Type** to **JavaScript Module**.
   - Click **Create**.

4. Hard-refresh your browser (`Ctrl + Shift + R` or `Cmd + Shift + R`) to load the new resource.

---

## Configuration

### Via the Visual Editor

1. Open your dashboard and click **Edit Dashboard** (pencil icon).
2. Click **Add Card** (+ button) and search for **Samsung Oven Card**.
3. Select your oven from the **Oven Device** dropdown (the editor automatically discovers LocalThings devices with "oven" in their name).
4. (Optional) Provide a custom **Card Title**.
5. Click **Save**.

### Via YAML

You can also configure the card manually in your Lovelace YAML:

```yaml
type: custom:samsung-oven-card
device_id: <your-oven-device-id>
title: Kitchen Oven # optional
```

#### Configuration Options

| Option      | Type   | Required | Default     | Description                                                                          |
| ----------- | ------ | -------- | ----------- | ------------------------------------------------------------------------------------ |
| `type`      | string | **Yes**  | —           | `custom:samsung-oven-card`                                                           |
| `device_id` | string | **Yes**  | —           | The Home Assistant device ID for your Samsung oven from the LocalThings integration. |
| `title`     | string | No       | Device Name | Custom title displayed in the card header.                                           |

> [!TIP]
> You can find your `device_id` by navigating to **Settings > Devices & Services > Devices**, selecting your oven, and copying the ID from the URL (or by using the visual card editor dropdown).

---

## Development & Testing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.
