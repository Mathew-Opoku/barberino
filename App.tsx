import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Role = 'customer' | 'barber';
type ViewMode = 'login' | 'customer' | 'barber' | 'display';
type BookingStatus = 'booked' | 'rejected' | 'completed';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  depositPounds: number;
};

type Barber = {
  id: string;
  name: string;
  chair: string;
  verified: boolean;
  services: Service[];
  availability: AvailabilityDay[];
};

type AvailabilityDay = {
  date: string;
  label: string;
  slots: string[];
};

type Booking = {
  id: string;
  barberId: string;
  code: string;
  initials: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  rejectionReason?: string;
};

const initialBarbers: Barber[] = [
  {
    id: 'barber-marcus',
    name: 'Marcus',
    chair: 'Chair 1',
    verified: true,
    services: [
      { id: 'shape', name: 'Shape-up', durationMinutes: 30, depositPounds: 2 },
      { id: 'cut', name: 'Haircut', durationMinutes: 45, depositPounds: 3 },
      { id: 'combo', name: 'Haircut + beard', durationMinutes: 60, depositPounds: 5 }
    ],
    availability: [
      { date: '2026-06-15', label: 'Mon 15 Jun', slots: ['10:30', '11:15', '12:30', '14:00'] },
      { date: '2026-06-16', label: 'Tue 16 Jun', slots: ['10:00', '11:30', '15:15', '16:00'] }
    ]
  },
  {
    id: 'barber-daniel',
    name: 'Daniel',
    chair: 'Chair 2',
    verified: true,
    services: [
      { id: 'cut', name: 'Haircut', durationMinutes: 40, depositPounds: 3 },
      { id: 'skin-fade', name: 'Skin fade', durationMinutes: 55, depositPounds: 5 },
      { id: 'beard', name: 'Beard trim', durationMinutes: 25, depositPounds: 2 }
    ],
    availability: [
      { date: '2026-06-15', label: 'Mon 15 Jun', slots: ['12:00', '13:00', '16:30'] },
      { date: '2026-06-17', label: 'Wed 17 Jun', slots: ['10:45', '13:15', '15:45'] }
    ]
  },
  {
    id: 'barber-new',
    name: 'New barber setup',
    chair: 'Pending chair',
    verified: false,
    services: [{ id: 'cut', name: 'Haircut', durationMinutes: 45, depositPounds: 3 }],
    availability: [{ date: '2026-06-18', label: 'Thu 18 Jun', slots: ['11:00', '12:00'] }]
  }
];

const initialBookings: Booking[] = [
  {
    id: 'b1',
    barberId: 'barber-marcus',
    code: 'A14',
    initials: 'MO',
    serviceId: 'shape',
    date: '2026-06-15',
    time: '10:30',
    status: 'completed'
  },
  {
    id: 'b2',
    barberId: 'barber-marcus',
    code: 'K82',
    initials: 'JD',
    serviceId: 'combo',
    date: '2026-06-15',
    time: '11:15',
    status: 'booked'
  },
  {
    id: 'b3',
    barberId: 'barber-daniel',
    code: 'M06',
    initials: 'ST',
    serviceId: 'skin-fade',
    date: '2026-06-15',
    time: '12:00',
    status: 'booked'
  }
];

export default function App() {
  const [mode, setMode] = useState<ViewMode>('login');
  const [role, setRole] = useState<Role>('customer');
  const [barbers, setBarbers] = useState<Barber[]>(initialBarbers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedBarberId, setSelectedBarberId] = useState('barber-marcus');
  const [selectedDate, setSelectedDate] = useState('2026-06-15');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedServiceId, setSelectedServiceId] = useState('cut');
  const [rejectionReason, setRejectionReason] = useState('Barber unavailable for this slot');

  const verifiedBarbers = useMemo(() => barbers.filter((barber) => barber.verified), [barbers]);
  const selectedBarber = verifiedBarbers.find((barber) => barber.id === selectedBarberId) ?? verifiedBarbers[0];
  const selectedDay = selectedBarber.availability.find((day) => day.date === selectedDate) ?? selectedBarber.availability[0];
  const selectedService =
    selectedBarber.services.find((service) => service.id === selectedServiceId) ?? selectedBarber.services[0];

  const activeBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === 'booked')
        .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`)),
    [bookings]
  );

  const nextBooking = activeBookings[0];
  const nextBarber = barbers.find((barber) => barber.id === nextBooking?.barberId);
  const nextService = nextBarber?.services.find((service) => service.id === nextBooking?.serviceId);

  function signIn(nextRole: Role) {
    setRole(nextRole);
    setMode(nextRole);
  }

  function createBarberAccount() {
    const newId = `barber-${Date.now()}`;
    setBarbers((current) => [
      ...current,
      {
        id: newId,
        name: 'Created barber',
        chair: 'Awaiting verification',
        verified: false,
        services: [{ id: 'cut', name: 'Haircut', durationMinutes: 45, depositPounds: 3 }],
        availability: [{ date: '2026-06-19', label: 'Fri 19 Jun', slots: ['10:00', '11:00', '14:00'] }]
      }
    ]);
    setRole('barber');
    setMode('barber');
  }

  function verifyBarber(id: string) {
    setBarbers((current) =>
      current.map((barber) =>
        barber.id === id ? { ...barber, verified: true, chair: barber.chair === 'Awaiting verification' ? 'Chair 3' : barber.chair } : barber
      )
    );
  }

  function selectBarber(id: string) {
    const barber = verifiedBarbers.find((item) => item.id === id);
    if (!barber) return;
    const firstDay = barber.availability[0];
    const firstService = barber.services[0];
    setSelectedBarberId(id);
    setSelectedDate(firstDay.date);
    setSelectedTime(firstDay.slots[0]);
    setSelectedServiceId(firstService.id);
  }

  function selectDate(date: string) {
    const day = selectedBarber.availability.find((item) => item.date === date);
    if (!day) return;
    setSelectedDate(date);
    setSelectedTime(day.slots[0]);
  }

  function createBooking() {
    const code = `${selectedBarber.name.charAt(0)}${Math.floor(10 + Math.random() * 89)}`;
    setBookings((current) => [
      ...current,
      {
        id: `b${Date.now()}`,
        barberId: selectedBarber.id,
        code,
        initials: 'ME',
        serviceId: selectedService.id,
        date: selectedDay.date,
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
            <Text style={styles.title}>Book by barber, date, and availability.</Text>
            <Text style={styles.copy}>
              Barbers create verified profiles with their own availability. Customers only see verified
              barbers and book dated slots that barber has opened.
            </Text>
          </View>

          <View style={styles.segmentedControl}>
            <ModeButton active={mode === 'login'} icon="log-in" label="Login" onPress={() => setMode('login')} />
            <ModeButton active={mode === 'barber'} icon="cut" label="Barber" onPress={() => signIn('barber')} />
            <ModeButton active={mode === 'customer'} icon="person" label="Customer" onPress={() => signIn('customer')} />
            <ModeButton active={mode === 'display'} icon="tv" label="Display" onPress={() => setMode('display')} />
          </View>

          {mode === 'login' ? (
            <LoginView createBarberAccount={createBarberAccount} role={role} setRole={setRole} signIn={signIn} />
          ) : null}

          {mode === 'barber' ? (
            <BarberView
              barbers={barbers}
              bookings={bookings}
              rejectionReason={rejectionReason}
              role={role}
              setRejectionReason={setRejectionReason}
              updateBooking={updateBooking}
              verifyBarber={verifyBarber}
            />
          ) : null}

          {mode === 'customer' ? (
            <CustomerView
              createBooking={createBooking}
              selectedBarber={selectedBarber}
              selectedBarberId={selectedBarberId}
              selectedDate={selectedDate}
              selectedServiceId={selectedServiceId}
              selectedTime={selectedTime}
              selectBarber={selectBarber}
              selectDate={selectDate}
              setSelectedServiceId={setSelectedServiceId}
              setSelectedTime={setSelectedTime}
              verifiedBarbers={verifiedBarbers}
            />
          ) : null}

          {mode === 'display' ? (
            <DisplayView
              activeBookings={activeBookings}
              barbers={barbers}
              nextBooking={nextBooking}
              nextService={nextService}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function LoginView({
  createBarberAccount,
  role,
  setRole,
  signIn
}: {
  createBarberAccount: () => void;
  role: Role;
  setRole: (role: Role) => void;
  signIn: (role: Role) => void;
}) {
  return (
    <>
      <Panel title="Login">
        <View style={styles.roleGrid}>
          <Pressable
            onPress={() => setRole('customer')}
            style={[styles.roleCard, role === 'customer' ? styles.optionActive : null]}
          >
            <Ionicons color="#f5c542" name="person" size={22} />
            <Text style={styles.optionTitle}>Customer account</Text>
            <Text style={styles.optionMeta}>Book a dated slot with a verified barber.</Text>
          </Pressable>
          <Pressable
            onPress={() => setRole('barber')}
            style={[styles.roleCard, role === 'barber' ? styles.optionActive : null]}
          >
            <Ionicons color="#f5c542" name="cut" size={22} />
            <Text style={styles.optionTitle}>Barber account</Text>
            <Text style={styles.optionMeta}>Manage profile, verification, availability, and bookings.</Text>
          </Pressable>
        </View>
        <TextInput placeholder="Email address" placeholderTextColor="#7b8794" style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor="#7b8794" secureTextEntry style={styles.input} />
        <Pressable onPress={() => signIn(role)} style={styles.primaryButton}>
          <Ionicons color="#111827" name="log-in" size={18} />
          <Text style={styles.primaryButtonText}>Sign in as {role}</Text>
        </Pressable>
      </Panel>

      <Panel title="Create account">
        <Text style={styles.copy}>
          Customer accounts can book immediately. Barber accounts are created first, then verified before
          customers can see and book them.
        </Text>
        <View style={styles.actionRow}>
          <Pressable onPress={() => signIn('customer')} style={styles.secondaryButton}>
            <Ionicons color="#f7f9fb" name="person-add" size={18} />
            <Text style={styles.secondaryButtonText}>Create customer</Text>
          </Pressable>
          <Pressable onPress={createBarberAccount} style={styles.secondaryButton}>
            <Ionicons color="#f7f9fb" name="storefront" size={18} />
            <Text style={styles.secondaryButtonText}>Create barber</Text>
          </Pressable>
        </View>
      </Panel>
    </>
  );
}

function BarberView({
  barbers,
  bookings,
  rejectionReason,
  role,
  setRejectionReason,
  updateBooking,
  verifyBarber
}: {
  barbers: Barber[];
  bookings: Booking[];
  rejectionReason: string;
  role: Role;
  setRejectionReason: (value: string) => void;
  updateBooking: (id: string, status: BookingStatus) => void;
  verifyBarber: (id: string) => void;
}) {
  const verifiedCount = barbers.filter((barber) => barber.verified).length;

  return (
    <>
      <Panel title="Barber accounts">
        <View style={styles.metricGrid}>
          <Metric label="Verified barbers" value={String(verifiedCount)} />
          <Metric label="Pending setup" value={String(barbers.length - verifiedCount)} />
          <Metric label="Signed in role" value={role} />
        </View>
        {barbers.map((barber) => (
          <View key={barber.id} style={styles.accountRow}>
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingTitle}>
                {barber.name} · {barber.chair}
              </Text>
              <Text style={styles.bookingMeta}>
                {barber.verified ? 'Verified and visible to customers' : 'Pending verification'}
              </Text>
            </View>
            {!barber.verified ? (
              <Pressable onPress={() => verifyBarber(barber.id)} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Verify</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </Panel>

      <Panel title="Availability by barber">
        {barbers.map((barber) => (
          <View key={barber.id} style={styles.availabilityBlock}>
            <Text style={styles.serviceName}>{barber.name}</Text>
            {barber.availability.map((day) => (
              <Text key={day.date} style={styles.serviceMeta}>
                {day.label}: {day.slots.join(', ')}
              </Text>
            ))}
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
          <BookingRow
            key={booking.id}
            barbers={barbers}
            booking={booking}
            updateBooking={updateBooking}
          />
        ))}
      </Panel>
    </>
  );
}

function CustomerView({
  createBooking,
  selectedBarber,
  selectedBarberId,
  selectedDate,
  selectedServiceId,
  selectedTime,
  selectBarber,
  selectDate,
  setSelectedServiceId,
  setSelectedTime,
  verifiedBarbers
}: {
  createBooking: () => void;
  selectedBarber: Barber;
  selectedBarberId: string;
  selectedDate: string;
  selectedServiceId: string;
  selectedTime: string;
  selectBarber: (id: string) => void;
  selectDate: (date: string) => void;
  setSelectedServiceId: (id: string) => void;
  setSelectedTime: (time: string) => void;
  verifiedBarbers: Barber[];
}) {
  const selectedDay = selectedBarber.availability.find((day) => day.date === selectedDate) ?? selectedBarber.availability[0];
  const selectedService =
    selectedBarber.services.find((service) => service.id === selectedServiceId) ?? selectedBarber.services[0];

  return (
    <>
      <Panel title="QR customer entry">
        <View style={styles.qrBox}>
          <Ionicons color="#111827" name="qr-code" size={82} />
        </View>
        <Text style={styles.copy}>
          The QR route should land here first: create or sign into a customer account, then choose a
          verified barber, date, service, and slot.
        </Text>
      </Panel>

      <Panel title="Choose barber">
        <View style={styles.optionGrid}>
          {verifiedBarbers.map((barber) => (
            <Pressable
              key={barber.id}
              onPress={() => selectBarber(barber.id)}
              style={[styles.option, selectedBarberId === barber.id ? styles.optionActive : null]}
            >
              <Text style={styles.optionTitle}>{barber.name}</Text>
              <Text style={styles.optionMeta}>
                {barber.chair} · {barber.availability.length} bookable dates
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel title="Choose date">
        <View style={styles.slotGrid}>
          {selectedBarber.availability.map((day) => (
            <Pressable
              key={day.date}
              onPress={() => selectDate(day.date)}
              style={[styles.datePill, selectedDate === day.date ? styles.slotActive : null]}
            >
              <Text style={[styles.slotText, selectedDate === day.date ? styles.slotTextActive : null]}>{day.label}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      <Panel title="Choose service">
        <View style={styles.optionGrid}>
          {selectedBarber.services.map((service) => (
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
          {selectedDay.slots.map((slot) => (
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
            Book {selectedService.name} with {selectedBarber.name} on {selectedDay.label} at {selectedTime}
          </Text>
        </Pressable>
      </Panel>
    </>
  );
}

function DisplayView({
  activeBookings,
  barbers,
  nextBooking,
  nextService
}: {
  activeBookings: Booking[];
  barbers: Barber[];
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
        const barber = barbers.find((item) => item.id === booking.barberId);
        const service = barber?.services.find((item) => item.id === booking.serviceId);
        return (
          <View key={booking.id} style={styles.displayRow}>
            <Text style={styles.displayCode}>{booking.code}</Text>
            <View style={styles.displayDetails}>
              <Text style={styles.displayTime}>
                {booking.date} · {booking.time}
              </Text>
              <Text style={styles.displayService}>
                {barber?.name} · {service?.name}
              </Text>
            </View>
          </View>
        );
      })}
      {!nextBooking ? <Text style={styles.copy}>No bookings currently waiting.</Text> : null}
    </Panel>
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
  barbers,
  booking,
  updateBooking
}: {
  barbers: Barber[];
  booking: Booking;
  updateBooking: (id: string, status: BookingStatus) => void;
}) {
  const barber = barbers.find((item) => item.id === booking.barberId);
  const service = barber?.services.find((item) => item.id === booking.serviceId);

  return (
    <View style={styles.bookingRow}>
      <View style={styles.codeBadge}>
        <Text style={styles.codeText}>{booking.code}</Text>
      </View>
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingTitle}>
          {booking.date} · {booking.time} · {barber?.name}
        </Text>
        <Text style={styles.bookingMeta}>
          {service?.name} · Customer initials: {booking.initials} · {booking.status}
        </Text>
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
  roleGrid: {
    gap: 10
  },
  roleCard: {
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14
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
  accountRow: {
    alignItems: 'center',
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12
  },
  availabilityBlock: {
    borderTopColor: '#29313c',
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 12
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
  datePill: {
    alignItems: 'center',
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 118,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
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
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center'
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#303946',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14
  },
  secondaryButtonText: {
    color: '#f7f9fb',
    fontSize: 14,
    fontWeight: '900'
  },
  smallButton: {
    backgroundColor: '#f5c542',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  smallButtonText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900'
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
  displayDetails: {
    flex: 1,
    gap: 3
  },
  displayTime: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  },
  displayService: {
    color: '#aeb8c4',
    flex: 1,
    fontSize: 15,
    fontWeight: '700'
  }
});
