import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  BackHandler,
  StatusBar,
} from 'react-native';
import { Download, AlertCircle, Sparkles, ExternalLink } from 'lucide-react-native';
import { AppUpdateState } from '@/lib/updates/versionCheck';

interface AppUpdateModalProps {
  updateState: AppUpdateState;
  onDismissOptional: () => void;
  onOpenUpdate: () => void;
}

export function AppUpdateModal({
  updateState,
  onDismissOptional,
  onOpenUpdate,
}: AppUpdateModalProps) {
  const { status, currentVersion, latestVersion, minimumVersion, isDismissed } = updateState;

  // Block Android hardware back press on mandatory update
  useEffect(() => {
    if (status === 'mandatory_update') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => backHandler.remove();
    }
  }, [status]);

  // 1. Mandatory Update (Blocks the entire screen permanently via native top-level Modal)
  if (status === 'mandatory_update') {
    return (
      <Modal
        visible={true}
        transparent={false}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={() => {
          // Permanently block Android hardware back button
        }}
      >
        <View style={styles.mandatoryContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.mandatoryCard}>
            <View style={styles.mandatoryIconCircle}>
              <AlertCircle size={40} color="#EF4444" />
            </View>

            <View style={styles.badgeCritical}>
              <Text style={styles.badgeCriticalText}>ACTION REQUIRED</Text>
            </View>

            <Text style={styles.mandatoryTitle}>Update Required</Text>
            <Text style={styles.mandatorySubtitle}>
              This version of FORGET Gym (v{currentVersion}) is no longer supported. Please install version {minimumVersion} or higher to continue.
            </Text>

            <View style={styles.versionPillContainer}>
              <Text style={styles.versionPillLabel}>Installed: <Text style={styles.versionHighlightOld}>v{currentVersion}</Text></Text>
              <Text style={styles.versionPillArrow}>→</Text>
              <Text style={styles.versionPillLabel}>Required: <Text style={styles.versionHighlightNew}>v{minimumVersion}</Text></Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButtonCritical}
              activeOpacity={0.85}
              onPress={onOpenUpdate}
            >
              <Download size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Download Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // 2. Optional Update (Prompt with Update & Later options)
  if (status === 'optional_update' && !isDismissed) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onDismissOptional}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionalCard}>
            <View style={styles.optionalIconCircle}>
              <Sparkles size={32} color="#10B981" />
            </View>

            <View style={styles.badgeUpdate}>
              <Text style={styles.badgeUpdateText}>NEW VERSION</Text>
            </View>

            <Text style={styles.optionalTitle}>Update Available</Text>
            <Text style={styles.optionalSubtitle}>
              Version {latestVersion} is now ready to download with fresh performance improvements and fixes.
            </Text>

            <View style={styles.versionPillContainer}>
              <Text style={styles.versionPillLabel}>Current: <Text style={styles.versionHighlightOld}>v{currentVersion}</Text></Text>
              <Text style={styles.versionPillArrow}>→</Text>
              <Text style={styles.versionPillLabel}>Latest: <Text style={styles.versionHighlightNew}>v{latestVersion}</Text></Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={onDismissOptional}
              >
                <Text style={styles.secondaryButtonText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButtonEmerald}
                activeOpacity={0.85}
                onPress={onOpenUpdate}
              >
                <ExternalLink size={18} color="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonTextDark}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  mandatoryContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mandatoryCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  mandatoryIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  badgeCritical: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 12,
  },
  badgeCriticalText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mandatoryTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  mandatorySubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  versionPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  versionPillLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  versionPillArrow: {
    color: '#6B7280',
    marginHorizontal: 10,
    fontSize: 15,
  },
  versionHighlightOld: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  versionHighlightNew: {
    color: '#10B981',
    fontWeight: '800',
  },
  primaryButtonCritical: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  optionalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  optionalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeUpdate: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: 10,
  },
  badgeUpdateText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  optionalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionalSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonEmerald: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryButtonTextDark: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});
