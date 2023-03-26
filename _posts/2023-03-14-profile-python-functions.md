---
layout: post
title: How to use v-model in Vue 3 to pass a value from parent to child component and then update the value from child to parent (BONUS - Example with Vuetify)
comments: true
show-avatar: false
tags: [vue, vue 3, v-model, vuetify, props, emits, composition API]
---


*It's been a good three years since I last wrote something, but anyways here we are.*

In this Example we use:
- Vue 3 (I code in Composition API but you can easily convert this to Options API)
- Vuetify 3 Framework (optional)

## TLDR - Just show me the code

Parent Component (shows counter):

{% raw %}
```html
<template>
  <p>Parent counter: {{ state.counter }}</p>
  <br>
  <Child v-model="state.counter"></Child>
</template>

<script setup>
import Child from './Child.vue';
import { reactive } from 'vue';

const state = reactive({
  counter: 0
})
</script>
```

Child Component (shows and update counter):
```html
<template>
    <!-- 
        We also show the counter on the child component to demonstrate that the counter
        on the parent and child components are in sync
     -->
    child counter: {{ props.modelValue }}
    <br>

    <!-- We emit a value to the parent component to increment/decrement the parent counter -->
    <v-btn @click.stop="e => $emit('update:modelValue', props.modelValue + 1)">+</v-btn>
    <v-btn @click.stop="e => $emit('update:modelValue', props.modelValue - 1)">-</v-btn>
</template>

<script setup>
// Outputs
defineEmits(['update:modelValue'])

// Inputs
const props = defineProps(['modelValue'])
</script>
```

{% endraw %}

It should look something like this: 
<br>
![v-model example 1](/img/v-model-example-1.png)



### Understanding How Props are Passed to Child and updated values are emitted to Parent Components

In Vue, to pass values to from parent to child, we use ``v-bind`` e.g. 
```html
<Child v-bind:msg="some_value"/>
``` 
or short hand, 
```html
<Child :msg="some_value" />
```

Then we would ``emit`` an updated value from the Child Component to update the value in the Parent Component e.g. 
```html
<Child :msg="some_value" @update_msg="e => update_msg(e)" />
```
Here you can see that we use v-bind to pass ``"some_value"`` to the ``msg`` prop. Then, the Child component emits an event called "update_msg" to which we assign our updater function to.

**We can simplify this process of passing a prop and updating using emit using ``v-model``**

realistically all v-model does in the previous example, is:
```html
// With v-bind and a custom update function
<Child :msg="some_value" @update_msg="e => update_msg(e)" />

// With v-model
<Child v-model="some_value" />
```
**IMPORTANT:** In order to achieve this you need to do 2 things:
1. Name the Child Component's prop ``"modelValue"`` (If your child component accepts multiple props, you only need to name the prop that you will later update to this)
2. Name the emit that is responsible for emitting the update value back to the parent, ```"update:modelValue"```.

**Keep Reading, Examples Below**

![diagram 1](/img/Vue_3-model-update_1.png)


***Code example of this is above in the TLDR section***

### Example 2 - Creating a custom Component to wrap around a Vuetify Component(s) and passing props and emits throught

In this example we have a Page called ``<FormPage>`` where we print  a list of fruits. We then have a Child component in the Page called ``<CustomList>`` which takes in the list of fruits as a prop and allows you to select which fruits to activate via checkbox.

![diagram 2](/img/Vue_3_model_update_2.png.png)

FormPage Component (Parent Component):

{% raw %}
```html
<template>
    Pick a fruit
    <br>
    list_items (Parent):
    <pre>{{ state.list_items }}</pre>
    <CustomList v-model="state.list_items"></CustomList>
</template>

<script setup>
import CustomList from './CustomList.vue';
import { reactive } from 'vue';
const state = reactive({
    list_items: []
})
</script>
```

CustomList Component (Child Component):

```html
<template>
    <p>Checklist (Child)</p>
    <br>
    <!-- 
        we use v-bind:model-value because we are getting our model value from props 
        which is read-only. We then use the @update:model-value to emit the updated
        value from the v-checkbox
     -->
    <v-checkbox v-for="item in list_items" density="compact" :value="item" :label="item" :model-value="props.modelValue"
        @update:model-value="$event => $emit('update:modelValue', $event)"></v-checkbox>
</template>

<script setup>
const list_items = ["banana", "apple", "orange"]
// Inputs
const props = defineProps(['modelValue'])
// Outputs
defineEmits(['update:modelValue'])
</script>
```
{% endraw %}

It should look like this:

![example 2](/img/v-model-example-2.png)