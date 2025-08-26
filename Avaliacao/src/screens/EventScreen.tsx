import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { api } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Event">;

export type EventDetail = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  stats: { total: number; checkedIn: number; absent: number };
};

export default function EventScreen({ navigation }: Props) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EventDetail>("/events/evt_123");
      setEvent(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar o evento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleUpdateStats = (checkedInDelta: number) => {
    if (event) {
      setEvent({
        ...event,
        stats: {
          total: event.stats.total,
          checkedIn: event.stats.checkedIn + checkedInDelta,
          absent: event.stats.absent - checkedInDelta,
        },
      });
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button
          title="Tentar novamente"
          onPress={fetchEvent}
          accessibilityLabel="Retry loading event"
        />
      </View>
    );
  if (!event) return <Text>Evento não encontrado</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text>
        {event.startsAt} → {event.endsAt}
      </Text>
      <Text>{event.location}</Text>
      <View style={styles.stats}>
        <Text>Total: {event.stats.total}</Text>
        <Text>Presentes: {event.stats.checkedIn}</Text>
        <Text>Ausentes: {event.stats.absent}</Text>
      </View>
      <Button
        title="Ver participantes"
        onPress={() =>
          navigation.navigate("Attendees", {
            eventId: event.id,
            onCheckin: handleUpdateStats,
          })
        }
        accessibilityLabel="Ver lista de participantes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  stats: { marginVertical: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
