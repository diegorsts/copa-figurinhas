import { doc, setDoc, onSnapshot, deleteField } from 'firebase/firestore'
import { db } from './firebase'

function userDoc(uid) {
  return doc(db, 'users', uid, 'album', 'stickers')
}

export async function saveStickers(uid, stickers) {
  // Monta o objeto para salvar, removendo chaves com valor 0
  const toSave = {}
  for (const [key, value] of Object.entries(stickers)) {
    toSave[key] = value === 0 ? deleteField() : value
  }
  await setDoc(userDoc(uid), toSave, { merge: true })
}

export function subscribeStickers(uid, callback) {
  return onSnapshot(
    userDoc(uid),
    (snap) => {
      callback(snap.exists() ? snap.data() : {})
    },
    (error) => {
      console.error('Firestore error:', error.code, error.message)
    }
  )
}
