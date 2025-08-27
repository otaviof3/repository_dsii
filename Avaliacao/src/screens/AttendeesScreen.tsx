import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Button,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { api } from "../services/api";
import debounce from "lodash.debounce";

type Props = NativeStackScreenProps<RootStackParamList, "Attendees">;

export type Attendee = {
  id: string;
  name: string;
  email: string;
  document: string;
  checkedInAt: string | null;
};

export default function AttendeesScreen({ route, navigation }: Props) {
  const { eventId, onCheckin } = route.params;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendees = useCallback(
    async (
      pageNum: number = 1,
      searchTerm: string = search,
      append = false
    ) => {
      if (!append) setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/events/${eventId}/attendees`, {
          params: { page: pageNum, limit, search: searchTerm },
        });

        const data: Attendee[] = res.data.data;
        const totalItems: number = res.data.total;
        setTotal(totalItems);

        setAttendees((prev) => {
          if (append) return [...prev, ...data];

          const prevMap = new Map(prev.map((a) => [a.id, a]));
          return data.map((a) => prevMap.get(a.id) || a);
        });

        setPage(pageNum);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar participantes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [eventId, limit, search]
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => fetchAttendees(1, value, false), 300),
    [fetchAttendees]
  );

  useEffect(() => {
    debouncedSearch(search);
  }, [search, debouncedSearch]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendees(1, search, false);
  };

  const loadMore = () => {
    if (attendees.length >= total || loadingMore || loading) return;
    setLoadingMore(true);
    fetchAttendees(page + 1, search, true);
  };

  const handleCheckin = (attendee: Attendee) => {
    navigation.navigate("Checkin", {
      eventId,
      attendeeId: attendee.id,
      name: attendee.name,
      checkedInAt: attendee.checkedInAt,
      onSuccess: (isCheckedIn?: boolean) => {
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === attendee.id
              ? {
                  ...a,
                  checkedInAt: isCheckedIn ? new Date().toISOString() : null,
                }
              : a
          )
        );
        if (typeof isCheckedIn === "boolean") {
          onCheckin?.(isCheckedIn ? 1 : -1);
        }
      },
    });
  };

  const filteredAttendees = attendees.filter((a) => {
    if (filter === "present") return a.checkedInAt;
    if (filter === "absent") return !a.checkedInAt;
    return true;
  });

  const renderItem = ({ item }: { item: Attendee }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: item.checkedInAt ? "#2f855a" : "#e53e3e" },
      ]}
      onPress={() => handleCheckin(item)}
      accessibilityLabel={`Check-in de ${item.name}, status: ${
        item.checkedInAt ? "Presente" : "Ausente"
      }`}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>
        {item.email} — {item.document}
      </Text>
      <Text style={styles.status}>
        {item.checkedInAt ? "Presente ✅" : "Ausente ❌"}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing)
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button title="Tentar novamente" onPress={() => fetchAttendees(1)} />
      </View>
    );

  if (filteredAttendees.length === 0)
    return (
      <View style={styles.center}>
        <Text>
          {search
            ? `Nada encontrado para '${search}'`
            : "Nenhum participante encontrado"}
        </Text>
      </View>
    );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        placeholder="Buscar por nome, e-mail ou documento"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <View style={styles.filters}>
        {["all", "present", "absent"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={styles.filterText}>
              {f === "all"
                ? "Todos"
                : f === "present"
                ? "Presentes"
                : "Ausentes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAttendees}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 6 },
  filters: { flexDirection: "row", marginBottom: 10 },
  filterBtn: { padding: 8, borderWidth: 1, borderRadius: 6, marginRight: 5 },
  filterActive: { backgroundColor: "#3182ce", borderColor: "#3182ce" },
  filterText: { color: "#fff" },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 5,
  },
  name: { fontWeight: "bold", color: "#fff" },
  info: { color: "#fff" },
  status: { marginTop: 5, fontWeight: "bold", color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
