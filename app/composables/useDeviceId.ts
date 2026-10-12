/** Условный идентификатор устройства: UUID в cookie на год. Нужен для записи покупки. */
export function useDeviceId() {
  const deviceId = useCookie<string>('device_id', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => createId()
  })
  if (!deviceId.value) {
    deviceId.value = createId()
  }
  return deviceId
}
