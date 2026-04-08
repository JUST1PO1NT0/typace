# react-typace (alpha)
**Forget about your 300ms search debounce in favour of adaptive debounce based on real data!**

This minimal, privacy-focused React library collects data as the user typing to leverage the power of statistics to determine when the search should fire. It resolves the problem of 300ms debounce where slow typers trigger search with every character they type, but fast typers are punished by the non-adaptive logic. This algorithm collects anonymised data about typing behaviour, such as typing speed, fire tolerance (how much this user prefers early fires), how often the user edits, and thinking (pause) times, all stored in a signle cookie. Implementation is minimal, with configs to come in the beta stage of development.

## Usage
**8 April 2026 NOTE: This package has not yet been published to npm registry**

```ts
import { useAdaptiveDebounce } from 'react-typace'

const InputComponent: React.FC = () => {
  const { bind } = useAdaptiveDebounce(handleFire(value));

  const handleFire = (value: string) => {
    // your fire logic goes here
  }

  return <input {...bind}/>
} 
```

Implementing typace has been made as easy as possible. Into your input element, simply spread `bind` received from the hook.
`useAdaptiveDebounce` will also expose debug typing session data if needed.

## Contributing
I'm very interested in making this useful for websites of all sizes, where one typing profile is shared everywhere for the library to access, so that websites which do not receive a lot of traffic may benefit from the user profiles accumulated from larger ones, or accross hundreds of smaller ones. My original idea was implementing a cookie which is cross-domain, but I have not found a solution that doesn't involve hosting a database and inserting an iframe, for which I do not have sufficient resources. If you have any ideas or resources which could lead to an implementation of this idea, *please* contact.

I am keen on improving the mathematics in this repository and storing more data which could lead to better approximations of debounce times. Additionally, I am interested in different approaches to better analyse the data received. Feel free to fork this repository and contact for assistance. 
