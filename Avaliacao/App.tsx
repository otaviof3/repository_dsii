import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EventScreen, { EventDetail } from "./src/screens/EventScreen";
import AttendeesScreen, { Attendee } from "./src/screens/AttendeesScreen";
import CheckinScreen from "./src/screens/CheckinScreen";

export type RootStackParamList = {
  Event: undefined;
  Attendees: { eventId: string; onCheckin?: (delta: number) => void };
  Checkin: {
    eventId: string;
    attendeeId: string;
    name: string;
    checkedInAt?: string | null; 
    onSuccess?: (isCheckedIn?: boolean) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Event">
        <Stack.Screen
          name="Event"
          component={EventScreen}
          options={{ title: "Evento" }}
        />
        <Stack.Screen
          name="Attendees"
          component={AttendeesScreen}
          options={{ title: "Participantes" }}
        />
        <Stack.Screen
          name="Checkin"
          component={CheckinScreen}
          options={{ title: "Check-in" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
