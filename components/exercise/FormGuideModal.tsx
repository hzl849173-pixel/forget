import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { X, Check, AlertCircle, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormGuide } from '@/constants/formGuides';

interface FormGuideModalProps {
  visible: boolean;
  guide: FormGuide | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const FormGuideModal: React.FC<FormGuideModalProps> = ({
  visible,
  guide,
  onClose,
  isDarkMode = true,
}) => {
  const insets = useSafeAreaInsets();

  if (!guide) return null;

  const theme = {
    background: isDarkMode ? '#121216' : '#FFFFFF',
    cardBg: isDarkMode ? '#1A1A22' : '#F9FAFB',
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
    textPrimary: isDarkMode ? '#FFFFFF' : '#111827',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    accent: '#10B981',
    warning: '#F59E0B',
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.background,
              borderColor: theme.borderColor,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          {/* Top Drag Indicator */}
          <View style={styles.dragHandleWrap}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB' },
              ]}
            />
          </View>

          {/* Modal Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <View style={[styles.pillBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.pillBadgeText, { color: theme.accent }]}>TECHNIQUE GUIDE</Text>
                </View>
              </View>
              <Text
                style={[styles.title, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {guide.name}
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {guide.targetMuscle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#F3F4F6' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Form GIF Demonstration */}
            <View
              style={[
                styles.gifContainer,
                {
                  backgroundColor: isDarkMode ? '#000000' : '#F3F4F6',
                  borderColor: theme.borderColor,
                },
              ]}
            >
              <Image
                source={guide.gif}
                style={styles.gifImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                priority="high"
              />
              <View style={styles.gifBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.gifBadgeText}>FORM LOOP</Text>
              </View>
            </View>

            {/* Key Execution Cues */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Check size={14} color={theme.accent} strokeWidth={2.6} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Key Form Cues</Text>
              </View>

              <View style={styles.cuesList}>
                {guide.cues.map((cue, idx) => (
                  <View key={idx} style={styles.cueRow}>
                    <View style={[styles.cueNumberBadge, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB' }]}>
                      <Text style={[styles.cueNumberText, { color: theme.textPrimary }]}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.cueText, { color: theme.textPrimary }]}>{cue}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Common Mistakes to Avoid */}
            {guide.commonMistakes && guide.commonMistakes.length > 0 && (
              <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 12 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <AlertCircle size={14} color={theme.warning} strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Mistakes to Avoid</Text>
                </View>

                <View style={styles.cuesList}>
                  {guide.commonMistakes.map((mistake, idx) => (
                    <View key={idx} style={styles.mistakeRow}>
                      <View style={[styles.mistakeBullet, { backgroundColor: theme.warning }]} />
                      <Text style={[styles.cueText, { color: theme.textSecondary }]}>{mistake}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Subtle Attribution / Free License Notice */}
            <View style={styles.footerNotice}>
              <Info size={12} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.footerNoticeText, { color: theme.textSecondary }]}>
                Open-source reference demonstration under Creative Commons (CC-BY).
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <View style={styles.footerWrap}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.accent }]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  gifContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  gifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  gifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cuesList: {
    gap: 10,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cueNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  cueNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cueText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mistakeBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 1,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  footerNoticeText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  footerWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
});
