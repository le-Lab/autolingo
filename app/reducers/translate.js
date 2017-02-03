
import Promise  from 'bluebird'
const API_KEY = 'AIzaSyC3kdlSGExiXj_bLAuDKXiNMeNciZuLE7w'
import { Observable } from 'rxjs'
import { ajax } from 'rxjs/observable/dom/ajax';
import { addToMessages } from './messagesReducer'
// **************************************************
// Actions
const ADD_TRANSLATION = "ADD_TRANSLATION"
const TRANSLATE = "TRANSLATE"

// Action creators
// Fed into the googleTranslateEpic
export const translateActionCreator = (id, originalLanguage, userLanguage, originalText) => {
  return (
    {
      type: TRANSLATE,
      id,
      originalLanguage, 
      userLanguage,
      originalText
    }
  )
}

// Dispatched from the epic to store
const addTranslation = (id, translation, language) => {
  return {
      type: ADD_TRANSLATION,
      translation,
      language,
      id
    }
}


// **************************************************
export const googleTranslateEpic = (action$) => {
  return action$.ofType(TRANSLATE)
    .debounceTime(200)
    .mergeMap(action => {
        let originalLanguage = action.originalLanguage
        let userLanguage = action.userLanguage
        let text = action.originalText

        return ajax({
          url: `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&source=${originalLanguage}&target=${userLanguage}&q=${text}`,
          crossDomain: true
        })
    })
    .map(singleTranslation => {
      let translatedText = singleTranslation.response ?
        singleTranslation.response.data.translations[0].translatedText : singleTranslation

      return addToMessages(translatedText)
    })

}

// *********************USE THIS FOR MESSAGE BOARD***********************************
// export const googleTranslateEpic = (action$) => {
//   return action$.ofType(TRANSLATE)
//     .debounceTime(200)
//     .mergeMap(action => {
//         let originalLanguage = action.originalLanguage
//         let userLanguage = action.userLanguage
//         let text = action.originalText

//         let translation = ajax({
//           url: `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&source=${originalLanguage}&target=fr&q=${text}`,
//           crossDomain: true
//         })
//         let korean = ajax({
//           url: `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&source=${originalLanguage}&target=ko&q=${text}`,
//           crossDomain: true
//         })
//         let english = ajax({
//           url: `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&source=${originalLanguage}&target=en&q=${text}`,
//           crossDomain: true
//         })

//         switch (originalLanguage) {
//           case 'en':
//             return Observable.combineLatest(french, korean, (fr, ko) => [{en: text}, {fr}, {ko}])
//           case 'fr':
//             return Observable.combineLatest(english, korean, (en, ko) => [{fr: text}, {en}, {ko}])
//           case 'ko':
//             return Observable.combineLatest(english, french, (en, fr) => [{ko: text}, {en}, {fr}])
//           default:
//             return []
//         }
//     })
//     .mergeMap(responseArray => Observable.from(responseArray))
//     .mergeMap(singleTranslation => {
//       let language = Object.keys(singleTranslation)[0]
//       let translatedData = singleTranslation[language]
//       let translatedText = translatedData.response ?
//         translatedData.response.data.translations[0].translatedText : translatedData

//       return [addTranslation(1, translatedText, language), addToMessages(translatedText)]
//     })
//       // return {type: ADD_TRANSLATION, translation: "testing", language: 'en', id: action.id}


// }




// **************************************************

export default function translateReducer(initialState = {}, action) {
  let newState;
  switch (action.type) {
    case ADD_TRANSLATION:
      let id = action.id;
      let messageObject = initialState[id] || {}

      let newTranslation = Object.assign({}, messageObject, {
        [action.language]: action.translation
      });

       newState = Object.assign({}, initialState, { [id]: newTranslation} )
       break;

    default:
      return initialState
  }
    return newState
}
