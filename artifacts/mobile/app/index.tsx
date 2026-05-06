import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
        <ActivityIndicator color="#6366f1" />
      </View>
    );
  }

  if (!session) return <Redirect href="/welcome" />;
  if (session.role === 'owner') return <Redirect href="/(owner)/dashboard" />;
  return <Redirect href="/(trainer)/attendance" />;
}
