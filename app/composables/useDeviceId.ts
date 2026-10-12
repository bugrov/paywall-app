/** Условный идентификатор устройства: UUID в cookie на год. Нужен для записи покупки. */
export function useDeviceId() {
  const deviceId = useCookie<string>('device_id', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    // По https cookie только по защищённому соединению; на http://localhost флаг мешал бы dev
    secure: useRequestURL().protocol === 'https:',
    default: () => createId()
  })
  if (!deviceId.value) {
    deviceId.value = createId()
  }
  return deviceId
}
