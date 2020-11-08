### Penser à installer python
```bash
apt install python2
apt install gimp-python
```

### Code python à lancer
```py
import sys
sys.path.append('/home/pierre/dev/leek-wars/meta/script')
import leekwars_chips
leekwars_chips.execute()
```

>>> Enlever le register() et le main() à la fin du script
