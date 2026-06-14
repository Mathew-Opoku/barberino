import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type BookingStatus = 'booked' | 'rejected' | 'cancelled' | 'completed';

type Service = {
  name: string;
  durationMinutes: number;
  depositPounds: number;
};

type Booking = {
  displayCode: string;
  service: string;
  time: string;
  status: BookingStatus;
};

const services: Service[] = [
  { name: 'Shape-up', durationMinutes: 30, depositPounds: 2 },
  { name: 'Haircut', durationMinutes: 45, depositPounds: 3 },
  { name: 'Haircut + beard', durationMinutes: 60, depositPounds: 5 }
];

const bookings: Booking[] = [
  { displayCode: 'A14', service: 'Shape-up', time: '10:30', status: 'booked' },
  { displayCode: 'K82', service: 'Haircut + beard', time: '11:15', status: 'booked' },
  { displayCode: 'M06', service: 'Haircut', time: '12:30', status: 'booked' }
];

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Barberino MVP</Text>
            <Text style={styles.title}>Bookings without the waiting-room confusion.</Text>
            <Text style={styles.copy}>
              Staff publish availability, customers book open slots by QR link, and barbers only step in
              when a booking needs rejecting or moving.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Today&apos;s queue display</Text>
            <View style={styles.currentSlot}>
              <Text style={styles.currentLabel}>Now serving</Text>
              <Text style={styles.currentValue}>Private</Text>
              <Text style={styles.currentHint}>Estimated 18 minutes remaining</Text>
            </View>
            {bookings.map((booking) => (
              <View key={booking.displayCode} style={styles.bookingRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{booking.displayCode}</Text>
                </View>
                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingTime}>{booking.time}</Text>
                  <Text style={styles.bookingService}>{booking.service}</Text>
                </View>
                <Text style={styles.bookingStatus}>{booking.status}</Text>
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Barber setup</Text>
            <Text style={styles.copy}>
              Availability controls, rejection reasons, short-notice lockout, deposits and push
              notifications will build from these service defaults.
            </Text>
            {services.map((service) => (
              <View key={service.name} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceMeta}>
                  {service.durationMinutes} min · £{service.depositPounds} deposit
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d1117'
  },
  screen: {
    gap: 18,
    padding: 20,
    paddingBottom: 36
  },
  header: {
    gap: 12,
    paddingTop: 12
  },
  kicker: {
    color: '#61dafb',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  title: {
    color: '#f7f9fb',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40
  },
  copy: {
    color: '#aeb8c4',
    fontSize: 16,
    lineHeight: 23
  },
  panel: {
    gap: 14,
    borderRadius: 8,
    backgroundColor: '#161b22',
    padding: 16
  },
  panelTitle: {
    color: '#f7f9fb',
    fontSize: 20,
    fontWeight: '800'
  },
  currentSlot: {
    gap: 4,
    borderRadius: 8,
    backgroundColor: '#22314a',
    padding: 14
  },
  currentLabel: {
    color: '#9fb7d9',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  currentValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800'
  },
  currentHint: {
    color: '#c9d7e8',
    fontSize: 15
  },
  bookingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    paddingTop: 12
  },
  codeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#f5c542',
    height: 44,
    width: 52
  },
  codeText: {
    color: '#151515',
    fontSize: 17,
    fontWeight: '900'
  },
  bookingDetails: {
    flex: 1
  },
  bookingTime: {
    color: '#f7f9fb',
    fontSize: 17,
    fontWeight: '800'
  },
  bookingService: {
    color: '#aeb8c4',
    fontSize: 14
  },
  bookingStatus: {
    color: '#69db7c',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  serviceRow: {
    gap: 4,
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    paddingTop: 12
  },
  serviceName: {
    color: '#f7f9fb',
    fontSize: 16,
    fontWeight: '800'
  },
  serviceMeta: {
    color: '#aeb8c4',
    fontSize: 14
  }
});
