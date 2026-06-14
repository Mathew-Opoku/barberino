import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'customer' | 'barber' | 'display';
type BookingStatus = 'booked' | 'rejected' | 'completed';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  depositPounds: number;
};

type Booking = {
  id: string;
  code: string;
  initials: string;
  serviceId: string;
  time: string;
  status: BookingStatus;
  rejectionReason?: string;
};

const services: Service[] = [
  { id: 'shape', name: 'Shape-up', durationMinutes: 30, depositPounds: 2 },
  { id: 'cut', name: 'Haircut', durationMinutes: 45, depositPounds: 3 },
  { id: 'combo', name: 'Haircut + beard', durationMinutes: 60, depositPounds: 5 }
];

const initialBookings: Booking[] = [
  { id: 'b1', code: 'A14', initials: 'MO', serviceId: 'shape', time: '10:30', status: 'completed' },
  { id: 'b2', code: 'K82', initials: 'JD', serviceId: 'combo', time: '11:15', status: 'booked' },
  { id: 'b3', code: 'M06', initials: 'ST', serviceId: 'cut', time: '12:30', status: 'booked' },
  { id: 'b4', code: 'R31', initials: 'AL', serviceId: 'shape', time: '14:00', status: 'booked' }
];

const availableSlots = ['11:15', '12:30', '14:00', '15:15', '16:00'];

export default function App() {
  const [mode, setMode] = useState<ViewMode>('barber');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedServiceId, setSelectedServiceId] = useState(services[1].id);
  const [selectedTime, setSelectedTime] = useState(availableSlots[3]);
  const [rejectionReason, setRejectionReason] = useState('Barber unavailable for this slot');

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'booked'),
    [bookings]
  );

  const nextBooking = activeBookings[0];
  const nextService = services.find((service) => service.id === nextBooking?.serviceId);

  function createBooking() {
    const service = services.find((item) => item.id === selectedServiceId) ?? services[0];
    const code = `${service.name.charAt(0)}${Math.floor(10 + Math.random() * 89)}`;

    setBookings((current) => [
      ...current,
      {
        id: `b${Date.now()}`,
        code,
        initials: 'ME',
        serviceId: selectedServiceId,
        time: selectedTime,
        status: 'booked'
      }
    ]);
  }

  function updateBooking(id: string, status: BookingStatus) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status,
              rejectionReason: status === 'rejected' ? rejectionReason : undefined
            }
          : booking
      )
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Barberino</Text>
            <Text style={styles.title}>Bookings, queue, and shop display in one place.</Text>
            <Text style={styles.copy}>
              Customers book open slots by QR. Barbers publish availability and only intervene
              when they need to reject, move, or clear a booking.
            </Text>
          </View>

          <View style={styles.segmentedControl}>
            <ModeButton active={mode === 'barber'} icon="cut" label="Barber" onPress={() => setMode('barber')} />
            <ModeButton active={mode === 'customer'} icon="person" label="Customer" onPress={() => setMode('customer')} />
            <ModeButton active={mode === 'display'} icon="tv" label="Display" onPress={() => setMode('display')} />
          </View>

          {mode === 'barber' ? (
            <BarberView
              bookings={bookings}
              rejectionReason={rejectionReason}
              setRejectionReason={setRejectionReason}
              updateBooking={updateBooking}
            />
          ) : null}

          {mode === 'customer' ? (
            <CustomerView
              createBooking={createBooking}
              selectedServiceId={selectedServiceId}
              selectedTime={selectedTime}
              setSelectedServiceId={setSelectedServiceId}
              setSelectedTime={setSelectedTime}
            />
          ) : null}

          {mode === 'display' ? (
            <DisplayView activeBookings={activeBookings} nextBooking={nextBooking} nextService={nextService} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onPress
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active ? styles.modeButtonActive : null]}>
      <Ionicons color={active ? '#111827' : '#d8dee9'} name={icon} size={18} />
      <Text style={[styles.modeText, active ? styles.modeTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function BarberView({
  bookings,
  rejectionReason,
  setRejectionReason,
  updateBooking
}: {
  bookings: Booking[];
  rejectionReason: string;
  setRejectionReason: (value: string) => void;
  updateBooking: (id: string, status: BookingStatus) => void;
}) {
  return (
    <>
      <Panel title="Availability">
        <Text style={styles.copy}>Open booking window: Tue-Sat, 10:00-18:00</Text>
        <Text style={styles.copy}>Short-notice lockout: customers cannot book within 6 hours.</Text>
        <View style={styles.metricGrid}>
          <Metric label="Services" value="3" />
          <Metric label="Deposit range" value="£2-£5" />
          <Metric label="Pending action" value="0" />
        </View>
      </Panel>

      <Panel title="Service defaults">
        {services.map((service) => (
          <View key={service.id} style={styles.serviceRow}>
            <View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceMeta}>{service.durationMinutes} minutes</Text>
            </View>
            <Text style={styles.deposit}>£{service.depositPounds}</Text>
          </View>
        ))}
      </Panel>

      <Panel title="Booking list">
        <TextInput
          onChangeText={setRejectionReason}
          placeholder="Reason shown when rejecting a booking"
          placeholderTextColor="#7b8794"
          style={styles.input}
          value={rejectionReason}
        />
        {bookings.map((booking) => (
          <BookingRow key={booking.id} booking={booking} updateBooking={updateBooking} />
        ))}
      </Panel>
    </>
  );
}

function CustomerView({
  createBooking,
  selectedServiceId,
  selectedTime,
  setSelectedServiceId,
  setSelectedTime
}: {
  createBooking: () => void;
  selectedServiceId: string;
  selectedTime: string;
  setSelectedServiceId: (id: string) => void;
  setSelectedTime: (time: string) => void;
}) {
  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];

  return (
    <>
      <Panel title="QR booking">
        <View style={styles.qrBox}>
          <Ionicons color="#111827" name="qr-code" size={82} />
        </View>
        <Text style={styles.copy}>
          New customers scan the shop QR, create an account, then choose from barber-published slots.
        </Text>
      </Panel>

      <Panel title="Choose a service">
        <View style={styles.optionGrid}>
          {services.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => setSelectedServiceId(service.id)}
              style={[styles.option, selectedServiceId === service.id ? styles.optionActive : null]}
            >
              <Text style={styles.optionTitle}>{service.name}</Text>
              <Text style={styles.optionMeta}>
                {service.durationMinutes} min · £{service.depositPounds} deposit
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel title="Available slots">
        <View style={styles.slotGrid}>
          {availableSlots.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setSelectedTime(slot)}
              style={[styles.slot, selectedTime === slot ? styles.slotActive : null]}
            >
              <Text style={[styles.slotText, selectedTime === slot ? styles.slotTextActive : null]}>{slot}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={createBooking} style={styles.primaryButton}>
          <Ionicons color="#111827" name="calendar" size={18} />
          <Text style={styles.primaryButtonText}>
            Book {selectedService.name} at {selectedTime}
          </Text>
        </Pressable>
      </Panel>
    </>
  );
}

function DisplayView({
  activeBookings,
  nextBooking,
  nextService
}: {
  activeBookings: Booking[];
  nextBooking?: Booking;
  nextService?: Service;
}) {
  return (
    <Panel title="Public monitor">
      <View style={styles.displayHero}>
        <Text style={styles.displayLabel}>Now serving</Text>
        <Text style={styles.displayPrivate}>Private</Text>
        <Text style={styles.displayHint}>
          Next slot in {nextService?.durationMinutes ?? 30} minutes
        </Text>
      </View>
      <Text style={styles.panelSubhead}>Coming up</Text>
      {activeBookings.map((booking) => {
        const service = services.find((item) => item.id === booking.serviceId);
        return (
          <View key={booking.id} style={styles.displayRow}>
            <Text style={styles.displayCode}>{booking.code}</Text>
            <Text style={styles.displayTime}>{booking.time}</Text>
            <Text style={styles.displayService}>{service?.name}</Text>
          </View>
        );
      })}
      {!nextBooking ? <Text style={styles.copy}>No bookings currently waiting.</Text> : null}
    </Panel>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function BookingRow({
  booking,
  updateBooking
}: {
  booking: Booking;
  updateBooking: (id: string, status: BookingStatus) => void;
}) {
  const service = services.find((item) => item.id === booking.serviceId);

  return (
    <View style={styles.bookingRow}>
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{booking.code}</Text>
      </View>
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingTitle}>
          {booking.time} · {service?.name}
        </Text>
        <Text style={styles.bookingMeta}>Customer initials: {booking.initials}</Text>
        {booking.rejectionReason ? <Text style={styles.rejectionText}>{booking.rejectionReason}</Text> : null}
      </View>
      <View style={styles.actionGroup}>
        <Pressable onPress={() => updateBooking(booking.id, 'completed')} style={styles.iconButton}>
          <Ionicons color="#69db7c" name="checkmark" size={18} />
        </Pressable>
        <Pressable onPress={() => updateBooking(booking.id, 'rejected')} style={styles.iconButton}>
          <Ionicons color="#ff8787" name="close" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101418'
  },
  screen: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 980,
    padding: 20,
    paddingBottom: 40,
    width: '100%'
  },
  header: {
    gap: 10,
    paddingTop: 12
  },
  kicker: {
    color: '#f5c542',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: '#f7f9fb',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40
  },
  copy: {
    color: '#aeb8c4',
    fontSize: 15,
    lineHeight: 22
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8
  },
  modeButton: {
    alignItems: 'center',
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10
  },
  modeButtonActive: {
    backgroundColor: '#f5c542',
    borderColor: '#f5c542'
  },
  modeText: {
    color: '#d8dee9',
    fontSize: 14,
    fontWeight: '800'
  },
  modeTextActive: {
    color: '#111827'
  },
  panel: {
    gap: 14,
    borderColor: '#29313c',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#171d24',
    padding: 16
  },
  panelTitle: {
    color: '#f7f9fb',
    fontSize: 20,
    fontWeight: '900'
  },
  panelSubhead: {
    color: '#f7f9fb',
    fontSize: 16,
    fontWeight: '900'
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10
  },
  metric: {
    borderRadius: 8,
    backgroundColor: '#222a34',
    flex: 1,
    gap: 4,
    padding: 12
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900'
  },
  metricLabel: {
    color: '#aeb8c4',
    fontSize: 12,
    fontWeight: '700'
  },
  serviceRow: {
    alignItems: 'center',
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  deposit: {
    color: '#f5c542',
    fontSize: 16,
    fontWeight: '900'
  },
  input: {
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    color: '#ffffff',
    minHeight: 46,
    paddingHorizontal: 12
  },
  bookingRow: {
    alignItems: 'center',
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12
  },
  codeBadge: {
    alignItems: 'center',
    backgroundColor: '#f5c542',
    borderRadius: 6,
    height: 44,
    justifyContent: 'center',
    width: 54
  },
  codeText: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900'
  },
  bookingDetails: {
    flex: 1,
    gap: 3
  },
  bookingTitle: {
    color: '#f7f9fb',
    fontSize: 15,
    fontWeight: '800'
  },
  bookingMeta: {
    color: '#aeb8c4',
    fontSize: 13
  },
  rejectionText: {
    color: '#ffb3b3',
    fontSize: 13
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8
  },
  iconButton: {
    alignItems: 'center',
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  qrBox: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5c542',
    borderRadius: 8,
    height: 132,
    justifyContent: 'center',
    width: 132
  },
  optionGrid: {
    gap: 10
  },
  option: {
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 14
  },
  optionActive: {
    borderColor: '#f5c542',
    backgroundColor: '#242516'
  },
  optionTitle: {
    color: '#f7f9fb',
    fontSize: 16,
    fontWeight: '900'
  },
  optionMeta: {
    color: '#aeb8c4',
    fontSize: 14
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  slot: {
    alignItems: 'center',
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 76,
    padding: 12
  },
  slotActive: {
    backgroundColor: '#f5c542',
    borderColor: '#f5c542'
  },
  slotText: {
    color: '#d8dee9',
    fontSize: 15,
    fontWeight: '900'
  },
  slotTextActive: {
    color: '#111827'
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#f5c542',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900'
  },
  displayHero: {
    backgroundColor: '#e7f5ff',
    borderRadius: 8,
    gap: 6,
    padding: 18
  },
  displayLabel: {
    color: '#335c75',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  displayPrivate: {
    color: '#111827',
    fontSize: 42,
    fontWeight: '900'
  },
  displayHint: {
    color: '#335c75',
    fontSize: 16,
    fontWeight: '700'
  },
  displayRow: {
    alignItems: 'center',
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12
  },
  displayCode: {
    color: '#f5c542',
    fontSize: 24,
    fontWeight: '900',
    width: 62
  },
  displayTime: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    width: 64
  },
  displayService: {
    color: '#aeb8c4',
    flex: 1,
    fontSize: 15,
    fontWeight: '700'
  }
});
