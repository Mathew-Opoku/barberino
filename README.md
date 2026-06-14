# Barberino

Barberino is an Expo React Native app for barber shops that want appointment booking,
live queue visibility and fewer ad-hoc customer messages.

## Product direction

- Customers join through a QR-accessible signup and book only inside availability published by staff.
- Bookings are opt-out: available slots are booked automatically unless a barber rejects,
  cancels or reschedules them.
- Barbers can configure services, default durations and small deposits.
- The public display should show privacy-safe booking codes, not full customer names.
- The first release targets one barber shop.

## Development

Install dependencies, then start Expo:

```sh
npm install
npm run start
```

This workspace was scaffolded manually because the current shell has Node available
through Codex but no npm binary on PATH.
