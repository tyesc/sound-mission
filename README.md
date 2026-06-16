<div align="center">

# Sound Mission

</div>

## Installation

### Pre-requisites

- Node >= 24 -> https://nodejs.org
- Cargo >= 1.93 -> https://doc.rust-lang.org/cargo

### Install dependencies

```bash
yarn install
```

## Usage

```bash
yarn tauri dev
```

## TODO
- [ ] Warn if a key is already binded
- [x] Add some models like Launchpad, keyboard, etc...
- [ ] Improve UI/UX
- [ ] Clean my shitty rust code (errors handling, thread, etc...)
- [ ] Play sounds on virtual input (Windows, Mac, Linux) (create or use existant virtual cable)
  - [x] Windows: VB-Cable or other, Mac: BalckHole or other (manual install)
  - [ ] Linux
- [ ] Redirect microphone stream into this virtual input to use it on Discord or whatever
- [ ] Add some settings like O/I volume
- [x] Add confirmation modals (save, clear, etc...)
- [x] Copy sound in data folder ?
- [ ] Can bind potentiometer or slider to control volume
- [x] Listen and update input & output connetions (udpate on dropdown clicked instead)
- [ ] Can crop the sound before saving it
