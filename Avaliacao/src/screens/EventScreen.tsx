import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
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
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EventDetail[]>("/events");
      setEvents(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCheckinUpdate = async (eventId: string) => {
    try {
      const res = await api.get(`/events/${eventId}/attendees`, {
        params: { page: 1, limit: 1000 },
      });
      const attendees = res.data.data;
      const total = attendees.length;
      const checkedIn = attendees.filter((a: any) => !!a.checkedInAt).length;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                stats: { total, checkedIn, absent: total - checkedIn },
              }
            : e
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar stats do evento", err);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button title="Tentar novamente" onPress={fetchEvents} />
      </View>
    );

  const renderItem = ({ item }: { item: EventDetail }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("Attendees", {
          eventId: item.id,
          onCheckin: () => handleCheckinUpdate(item.id),
        })
      }
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text>
        {item.startsAt} → {item.endsAt}
      </Text>
      <Text>{item.location}</Text>
      <Text>
        Total: {item.stats.total} | Presentes: {item.stats.checkedIn} |
        Ausentes: {item.stats.absent}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
