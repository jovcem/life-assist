import { useState, useEffect, useRef } from 'react'
import { Sun, CloudSun, Moon, Zap, Flame, Dumbbell, Coffee, Briefcase, CircleDot, Sparkles, ListChecks, Plus, X, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import MEALS from '@/data/meals.json'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const WORKOUTS = {
  Wednesday: {
    label: 'Full Body A',
    exercises: ['Squat 4×8', 'Bench Press 4×8', 'Barbell Row 3×10', 'Overhead Press 3×10', 'Leg Raises 3×15'],
  },
  Saturday: {
    label: 'Full Body B',
    exercises: ['Deadlift 4×5', 'Pull-ups 4×8', 'Leg Press 4×10', 'Incline Press 3×10', 'Cable Row 3×12'],
  },
}

const TAGS = {
  Monday: [{ label: 'Office', color: 'bg-blue-100 text-blue-700', icon: Briefcase }],
  Tuesday: [
    { label: 'Office', color: 'bg-blue-100 text-blue-700', icon: Briefcase },
    { label: 'Football', color: 'bg-green-100 text-green-700', icon: CircleDot },
  ],
  Wednesday: [{ label: 'Gym', color: 'bg-orange-100 text-orange-700', icon: Dumbbell }],
  Thursday: [
    { label: 'Office', color: 'bg-blue-100 text-blue-700', icon: Briefcase },
    { label: 'Football', color: 'bg-green-100 text-green-700', icon: CircleDot },
  ],
  Saturday: [{ label: 'Gym', color: 'bg-orange-100 text-orange-700', icon: Dumbbell }],
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

const MEAL_STYLES = {
  Breakfast:        { badge: 'bg-yellow-100 text-yellow-700', icon: Sun },
  Brunch:           { badge: 'bg-yellow-100 text-yellow-700', icon: Coffee },
  Lunch:            { badge: 'bg-sky-100 text-sky-700',       icon: CloudSun },
  Dinner:           { badge: 'bg-indigo-100 text-indigo-700', icon: Moon },
  'Lunch/Dinner':   { badge: 'bg-sky-100 text-sky-700',       icon: CloudSun },
  'Pre-Football':   { badge: 'bg-green-100 text-green-700',   icon: Zap },
  Recovery:         { badge: 'bg-purple-100 text-purple-700', icon: Flame },
  'Post-Gym':       { badge: 'bg-orange-100 text-orange-700', icon: Dumbbell },
}

const MEAL_GROUP = { Lunch: 'Lunch/Dinner', Dinner: 'Lunch/Dinner' }
const getMealGroup = (label) => MEAL_GROUP[label] ?? label

function Macros({ macros }) {
  return (
    <div className="mt-2 flex gap-2">
      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">P {macros.protein}g</span>
      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">C {macros.carbs}g</span>
      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">F {macros.fat}g</span>
    </div>
  )
}

function MealCard({ day, time, label, meal, kcal, macros, where, ingredients, recipe, alternatives, selectedIdx, onChangeIdx, disabledMeals }) {
  const options = alternatives ?? [{ day, time, label, meal, kcal, macros, where, ingredients, recipe }]
  const idx = selectedIdx ?? 0
  const [open, setOpen] = useState(false)
  const [slideDir, setSlideDir] = useState(null)
  const touchStartX = useRef(null)

  const cur = options[idx]
  const style = MEAL_STYLES[label] ?? { badge: 'bg-gray-100 text-gray-600', icon: Sun }
  const Icon = style.icon
  const multi = options.length > 1
  const isDisabled = !!disabledMeals?.[`${cur.day}::${label}`]

  function go(dir, e) {
    e?.stopPropagation()
    if (isDisabled) return
    setSlideDir(dir)
    setTimeout(() => setSlideDir(null), 200)
    onChangeIdx((idx + dir + options.length) % options.length)
  }

  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  return (
    <div
      className="overflow-hidden rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`relative cursor-pointer px-8 py-2 transition-opacity duration-200 ${slideDir !== null ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => setOpen((o) => !o)}
      >
        {multi && (
          <>
            <button
              onClick={(e) => go(-1, e)}
              disabled={isDisabled}
              className={`absolute left-0 top-0 h-full w-7 flex items-center justify-start pl-1 z-10 transition-colors ${isDisabled ? 'cursor-not-allowed opacity-25 text-muted-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => go(1, e)}
              disabled={isDisabled}
              className={`absolute right-0 top-0 h-full w-7 flex items-center justify-end pr-1 z-10 transition-colors ${isDisabled ? 'cursor-not-allowed opacity-25 text-muted-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
            <Icon size={10} />
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            {multi && (
              <span className="text-[9px] font-medium text-muted-foreground">{cur.day?.slice(0, 3)}</span>
            )}
            <span className="text-[10px] text-muted-foreground">{cur.time}</span>
            <span className="text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
          </div>
        </div>
        <p className="mt-1.5 text-sm font-medium">{cur.meal}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">{cur.where}</span>
          <span className="text-[10px] font-semibold text-emerald-600">{cur.kcal} kcal</span>
        </div>
        {multi && (
          <div className="mt-1.5 flex justify-center">
            <div className="flex gap-0.5">
              {options.map((_, i) => (
                <span key={i} className={`inline-block h-1 w-1 rounded-full transition-colors ${i === idx ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {open && (
        <div className="border-t px-2 pb-2 pt-2">
          <Macros macros={cur.macros} />
          <p className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingredients</p>
          <ul className="mb-2 flex flex-col gap-0.5">
            {cur.ingredients.map((ing) => (
              <li key={ing} className="text-[11px] text-foreground">· {ing}</li>
            ))}
          </ul>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recipe</p>
          <ol className="flex flex-col gap-2">
            {cur.recipe.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function ExpandableMealCard({ day, time, meal, kcal, macros, ingredients, recipe, disabled, onToggleDisabled }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-md border bg-card shadow-sm transition-shadow hover:shadow-md ${disabled ? 'opacity-40' : ''}`}>
      <div className="cursor-pointer p-3" onClick={() => setOpen((o) => !o)}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground">{day.slice(0, 3)}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{time}</span>
            <button
              className={`rounded px-1 py-0.5 text-[9px] font-semibold transition-colors ${
                disabled
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
              onClick={(e) => { e.stopPropagation(); onToggleDisabled() }}
            >
              {disabled ? 'Enable' : 'Disable'}
            </button>
            <span className="text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
          </div>
        </div>
        <p className={`text-sm font-medium leading-snug ${disabled ? 'line-through' : ''}`}>{meal}</p>
        <p className="mt-1.5 text-[10px] font-semibold text-emerald-600">{kcal} kcal</p>
      </div>
      {open && (
        <div className="border-t px-3 pb-3 pt-2">
          <Macros macros={macros} />
          <p className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingredients</p>
          <ul className="mb-2 flex flex-col gap-0.5">
            {ingredients.map((ing) => (
              <li key={ing} className="text-[11px]">· {ing}</li>
            ))}
          </ul>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recipe</p>
          <ol className="flex flex-col gap-2">
            {recipe.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">{i + 1}</span>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function DayTotal({ meals, disabledKeys }) {
  const total = meals.filter((m) => !disabledKeys.has(`${m.label}`)).reduce((sum, m) => sum + m.kcal, 0)
  return (
    <div className="mt-1 flex items-center justify-between rounded-md bg-muted dark:bg-[#3c3f41] px-2 py-1">
      <span className="text-[10px] font-semibold text-muted-foreground dark:text-[#a9b7c6]">Daily total</span>
      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{total} kcal</span>
    </div>
  )
}

function TaskCard({ text, onRemove }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card px-2 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <ClipboardList size={11} className="text-muted-foreground" />
        <span className="text-xs">{text}</span>
      </div>
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive">
        <X size={11} />
      </button>
    </div>
  )
}

function loadDisabled() {
  try {
    return JSON.parse(localStorage.getItem('disabledMeals') ?? '{}')
  } catch {
    return {}
  }
}

export default function App() {
  const [tasks, setTasks] = useState({})
  const [dialogDay, setDialogDay] = useState(null)
  const [input, setInput] = useState('')
  const [disabledMeals, setDisabledMeals] = useState(loadDisabled)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const mealsByLabel = Object.entries(MEALS).reduce((acc, [d, meals]) => {
    meals.forEach((m) => {
      const group = getMealGroup(m.label)
      if (!acc[group]) acc[group] = []
      acc[group].push({ ...m, day: d })
    })
    return acc
  }, {})

  const [mealSelections, setMealSelections] = useState({})
  const [activeDayIdx, setActiveDayIdx] = useState(() => {
    const i = DAYS.indexOf(today)
    return i >= 0 ? i : 0
  })
  const dayTouchStart = useRef(null)

  function getMealIdx(day, label) {
    const key = `${day}::${label}`
    if (key in mealSelections) return mealSelections[key]
    const options = mealsByLabel[label] ?? []
    const def = options.findIndex((a) => a.day === day)
    return def >= 0 ? def : 0
  }

  function setMealIdx(day, label, idx) {
    setMealSelections((prev) => ({ ...prev, [`${day}::${label}`]: idx }))
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  function toggleMeal(day, label) {
    const key = `${day}::${label}`
    setDisabledMeals((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      localStorage.setItem('disabledMeals', JSON.stringify(next))
      return next
    })
  }

  function addTask() {
    if (!input.trim()) return
    setTasks((prev) => ({
      ...prev,
      [dialogDay]: [...(prev[dialogDay] ?? []), input.trim()],
    }))
    setInput('')
    setDialogDay(null)
  }

  function removeTask(day, i) {
    setTasks((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, idx) => idx !== i),
    }))
  }

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeHours = now.getHours() % 12 || 12
  const timeMinutes = String(now.getMinutes()).padStart(2, '0')
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function renderDayCardContent(day) {
    return (
      <CardContent className="flex flex-col gap-2">
        {TAGS[day]?.map(({ label, color, icon: Icon }) => (
          <div key={label} className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${color}`}>
            <Icon size={12} />
            {label}
          </div>
        ))}
        {WORKOUTS[day] && (
          <div className="rounded-md border border-orange-200 bg-orange-50 p-2">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-orange-700">
              <ListChecks size={12} />
              {WORKOUTS[day].label}
            </p>
            <ul className="flex flex-col gap-1">
              {WORKOUTS[day].exercises.map((ex) => (
                <li key={ex} className="text-xs text-orange-600">· {ex}</li>
              ))}
            </ul>
          </div>
        )}
        {MEALS[day] && (
          <div className="mt-1 flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meals</p>
            {MEALS[day].map((m) => (
              <MealCard
                key={m.label}
                {...m}
                day={day}
                alternatives={mealsByLabel[getMealGroup(m.label)]}
                selectedIdx={getMealIdx(day, m.label)}
                onChangeIdx={(i) => setMealIdx(day, m.label, i)}
                disabledMeals={disabledMeals}
              />
            ))}
            <DayTotal
              meals={MEALS[day].map((m) => {
                const opts = mealsByLabel[getMealGroup(m.label)] ?? [m]
                return opts[getMealIdx(day, m.label)] ?? m
              })}
              disabledKeys={new Set()}
            />
          </div>
        )}
        {tasks[day]?.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tasks</p>
            {tasks[day].map((t, i) => (
              <TaskCard key={i} text={t} onRemove={() => removeTask(day, i)} />
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 w-full justify-start gap-1.5 text-xs text-muted-foreground"
          onClick={() => setDialogDay(day)}
        >
          <Plus size={12} />
          Add task
        </Button>
      </CardContent>
    )
  }

  const activeDay = DAYS[activeDayIdx]

  return (
    <div className="min-h-screen flex flex-col md:block p-4 pb-0 md:p-6" style={dark ? {
      backgroundColor: '#141416',
      backgroundImage: `radial-gradient(circle, #ffffff0d 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    } : {
      backgroundColor: '#f7f7f8',
      backgroundImage: `radial-gradient(circle, #00000011 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    }}>
      <div className="mb-4 flex items-center justify-between">
        {/* Mobile: Apple-style time/date — fills left side */}
        <div className="select-none md:invisible">
          <div className="flex items-start gap-1">
            <span className="text-[40px] font-light leading-none tracking-tight text-foreground">
              {timeHours}:{timeMinutes}
            </span>
            <span className="mt-1.5 text-sm font-light text-muted-foreground">{ampm}</span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{dateStr}</p>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Mobile: single swipeable day card */}
      <div
        className="flex flex-1 flex-col md:hidden"
        onTouchStart={(e) => { dayTouchStart.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (dayTouchStart.current === null) return
          const dx = e.changedTouches[0].clientX - dayTouchStart.current
          if (Math.abs(dx) > 40) setActiveDayIdx((i) => (i + (dx < 0 ? 1 : -1) + DAYS.length) % DAYS.length)
          dayTouchStart.current = null
        }}
      >
        {/* Day navigation header */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setActiveDayIdx((i) => (i - 1 + DAYS.length) % DAYS.length)}
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-foreground">{activeDay}</span>
            {activeDay === today && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                <Sparkles size={9} /> Today
              </span>
            )}
            {activeDay === DAYS[(DAYS.indexOf(today) + 1) % DAYS.length] && (
              <span className="text-[10px] font-medium text-muted-foreground">Tomorrow</span>
            )}
          </div>
          <button
            onClick={() => setActiveDayIdx((i) => (i + 1) % DAYS.length)}
            className="rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        {/* Dot indicators */}
        <div className="mb-3 flex justify-center gap-1.5">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setActiveDayIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === activeDayIdx ? 'w-4 bg-foreground' : 'w-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </div>
        {/* Active day card */}
        <Card className={`flex-1 -mx-4 rounded-none border-x-0 ${
          activeDay === today
            ? 'border-fuchsia-400 shadow-md bg-gradient-to-b from-fuchsia-100 via-fuchsia-50 to-transparent dark:from-fuchsia-950 dark:via-fuchsia-900/30 dark:to-transparent'
            : 'border-border'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground">{activeDay}</CardTitle>
          </CardHeader>
          {renderDayCardContent(activeDay)}
        </Card>
      </div>

      {/* Desktop: horizontal scroll of all days */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
        {DAYS.map((day) => (
          <Card
            key={day}
            className={`min-w-[200px] flex-1 shrink-0 border ${
              day === today
                ? 'border-fuchsia-400 shadow-md bg-gradient-to-b from-fuchsia-100 via-fuchsia-50 to-transparent dark:from-fuchsia-950 dark:via-fuchsia-900/30 dark:to-transparent'
                : 'border-border'
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-muted-foreground">{day}</CardTitle>
              {day === today && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <Sparkles size={11} />
                  Today
                </span>
              )}
            </CardHeader>
            {renderDayCardContent(day)}
          </Card>
        ))}
      </div>

      {/* All Meals — desktop only */}
      <div className="hidden md:block mt-6">
        <p className="mb-3 text-base font-semibold uppercase tracking-wide text-muted-foreground">All Meals</p>
        {(() => {
          const grouped = {}
          Object.entries(MEALS).forEach(([day, meals]) => {
            meals.forEach((m) => {
              const group = getMealGroup(m.label)
              if (!grouped[group]) grouped[group] = []
              grouped[group].push({ ...m, day })
            })
          })
          return (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {Object.entries(grouped).map(([label, items]) => {
                const style = MEAL_STYLES[label] ?? { badge: 'bg-gray-100 text-gray-600', icon: Sun }
                const Icon = style.icon
                return (
                  <div key={label} className="min-w-[200px] flex-1 shrink-0 rounded-xl border bg-card/70 p-3 shadow-sm">
                    <div className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${style.badge}`}>
                      <Icon size={12} />
                      {label}
                    </div>
                    <div className="flex flex-col gap-2">
                      {items.map((m) => (
                        <ExpandableMealCard
                          key={m.day}
                          {...m}
                          disabled={!!disabledMeals[`${m.day}::${m.label}`]}
                          onToggleDisabled={() => toggleMeal(m.day, m.label)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      <Dialog open={!!dialogDay} onOpenChange={() => setDialogDay(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add task — {dialogDay}</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Go to dentist"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <Button onClick={addTask}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
