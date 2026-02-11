"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { requestPermission, messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";

export function PushNotificationManager() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const setupNotifications = async () => {
            try {
                const token = await requestPermission();
                if (token) {
                    console.log("FCM Token registered:", token);
                    await api.patch("/users/fcm-token", { token });
                }
            } catch (error) {
                console.error("Failed to setup push notifications", error);
            }
        };

        setupNotifications();

        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log("Foreground message received:", payload);
                toast.info(payload.notification?.title || "New Notification", {
                    description: payload.notification?.body,
                });
            });

            return () => unsubscribe();
        }
    }, [user]);

    return null; // This component doesn't render anything
}
