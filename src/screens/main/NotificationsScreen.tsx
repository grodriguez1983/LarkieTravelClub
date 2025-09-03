import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, gradients } from '../../constants/colors';
import { NavigationProps, Notification } from '../../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from '../../services/mockData';

export const NotificationsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationData = await getNotifications();
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Handle navigation based on actionUrl
    if (notification.actionUrl) {
      switch (notification.actionUrl) {
        case '/map':
          navigation.navigate('Map');
          break;
        case '/rewards':
          navigation.navigate('Rewards');
          break;
        case '/profile':
          navigation.navigate('Profile');
          break;
        case '/pre-checkin':
          navigation.navigate('PreCheckIn');
          break;
        default:
          // Stay on notifications screen
          break;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconColor = priority === 'high' || priority === 'urgent' 
      ? Colors.accent.errorRed 
      : Colors.primary.larkieBlue;

    switch (type) {
      case 'welcome': return <Ionicons name="hand-right" size={24} color={iconColor} />;
      case 'points': return <Ionicons name="star" size={24} color={iconColor} />;
      case 'achievement': return <Ionicons name="trophy" size={24} color={iconColor} />;
      case 'location': return <Ionicons name="location" size={24} color={iconColor} />;
      case 'reward': return <Ionicons name="gift" size={24} color={iconColor} />;
      case 'reservation': return <Ionicons name="calendar" size={24} color={iconColor} />;
      case 'promotion': return <Ionicons name="pricetag" size={24} color={iconColor} />;
      case 'reminder': return <Ionicons name="alarm" size={24} color={iconColor} />;
      default: return <Ionicons name="notifications" size={24} color={iconColor} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary.deepNavy} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={Colors.neutral.gray} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyMessage}>
              You'll see important updates and rewards here
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadNotification,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.read && styles.unreadTitle,
                      ]}
                      numberOfLines={2}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={3}>
                      {notification.message}
                    </Text>
                    <View style={styles.notificationFooter}>
                      <Text style={styles.notificationTime}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteNotification(notification.id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={20} color={Colors.neutral.gray} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary.larkieBlue,
  },
  markAllText: {
    fontSize: 12,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.deepNavy,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    shadowColor: Colors.primary.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderColor: Colors.primary.larkieBlue,
    backgroundColor: '#F8FEFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.deepNavy,
    marginBottom: 4,
    lineHeight: 20,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.larkieBlue,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});