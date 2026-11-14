# AquaSense: Low-Power Smart Irrigation for Smallholder Farms
Final Year Design Project proposal, Department of Electrical Engineering, COMSATS University Islamabad.
Team: Ayesha Noor, Bilal Ahmed, Hamza Tariq. Supervisor: Dr. Sara Malik.

## 1. Problem
Smallholder farms in Punjab over-irrigate by an estimated 30-40 % (PCRWR 2023 field survey), wasting groundwater and electricity for tube-wells.

## 2. Proposed system
Soil-moisture sensor nodes (capacitive sensor + DS18B20 temperature) built on an ESP32-C3, reporting every 15 minutes over LoRa (SX1276, 868 MHz) to a solar-powered gateway. The gateway forwards readings over MQTT to a cloud dashboard and drives a relay that switches the tube-well pump. A rule engine opens the valve when moisture drops below a crop-specific threshold.

## 3. Design targets
- Node battery life: 12 months on 2 x AA (target)
- LoRa range: 2 km line of sight (target)
- Cost per node: under PKR 4,500 (estimate)

## 4. Status
Hardware is being prototyped. One node and the gateway work on the bench; field trial planned for March 2027. No field data yet.
