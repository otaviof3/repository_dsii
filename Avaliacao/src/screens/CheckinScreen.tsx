import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { api } from "../services/api";
import Toast from "react-native-root-toast";

type Props = NativeStackScreenProps<RootStackParamList, "Checkin">;

export default function CheckinScreen({ route, navigation }: Props) {
  const {
    eventId,
    attendeeId,
    name,
    checkedInAt: initialCheckedInAt,
    onSuccess,
  } = route.params;

  const [checkedInAt, setCheckedInAt] = useState<string | null | undefined>(
    route.params.checkedInAt
  );
  const [loading, setLoading] = useState(false);

  const toggleCheckin = async () => {
    setLoading(true);

    if (!checkedInAt) {
      try {
        const res = await api.post(`/events/${eventId}/checkin`, {
          attendeeId,
        });
        const time = res.data.checkedInAt;
        setCheckedInAt(time);
        Toast.show(`${name} fez check-in!`, {
          duration: Toast.durations.SHORT,
        });
        onSuccess?.(true);
      } catch (err: any) {
        if (err.response?.status === 409) {
          const time = err.response.data.checkedInAt;
          setCheckedInAt(time);
          const localTime = new Date(time).toLocaleTimeString();
          Toast.show(`${name} já presente desde ${localTime}`, {
            duration: Toast.durations.SHORT,
          });
          onSuccess?.(true);
        } else {
          Toast.show("Erro ao realizar check-in.", {
            duration: Toast.durations.SHORT,
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await api.post(`/events/${eventId}/undo-checkin`, { attendeeId });
      } catch {
        // se falhar, desfaz no front
      }
      setCheckedInAt(null);
      Toast.show(`Check-in de ${name} desfeito`, {
        duration: Toast.durations.SHORT,
      });
      onSuccess?.(false);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {loading && <ActivityIndicator size="large" />}

      <Text style={{ marginVertical: 10 }}>
        Status: {checkedInAt ? "Presente ✅" : "Ausente ❌"}
      </Text>

      <Button
        title={checkedInAt ? "Desfazer Check-in" : "Fazer Check-in"}
        onPress={toggleCheckin}
        accessibilityLabel={
          checkedInAt ? "Desfazer check-in" : "Fazer check-in"
        }
      />

      <View style={{ height: 20 }} />

      <Button
        title="Fechar"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Fechar modal de check-in"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
