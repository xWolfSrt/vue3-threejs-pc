<template>
    <div class="container">搜索</div>
</template>
<script lang="ts" setup>
import { ref, reactive, getCurrentInstance, onMounted, ComponentInternalInstance } from 'vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
// const proxy = getCurrentInstance()?.proxy
interface People {
    name: string
    age: number
    speak?: Function
}
class Man implements People {
    name = ''

    age = 1

    constructor(name: string, age: number) {
        this.name = name
        this.age = age
    }
    speak() {
        console.log('我是' + this.name)
    }
}
class SuperMan extends Man {
    sex: string = ''
    constructor(name: string, age: number, sex: string) {
        super(name, age)
        this.sex = sex
    }
    hit() {
        console.log(this.sex + '  hit  ' + this.name + ' ' + this.age)
    }
}
enum Color {
    RED,
    GREEN = 10,
    YELLOW,
}
onMounted(() => {
    let wo: People = {
        name: 'a',
        age: 18,
    }
    wo.age = 11

    console.log(wo)

    let ta = reactive<People>({
        name: '',
        age: 0,
    })
    ta.name = 'a'

    console.log(ta)

    let man = new Man('张三', 18)
    man.speak()

    let superman = new SuperMan('李四', 100, '男')
    superman.hit()

    console.log(proxy?.$router)

    let arr = reactive<Array<string>>(['a', 'b', 'c'])
    let arr1 = reactive<string[]>(['a', 'b', 'c'])
    console.log(arr)
    console.log(arr1)
    console.log(Color.GREEN)
    console.log(Color.YELLOW)
    console.log(test<string>('a'))
    console.log(test(1))
})

function test<T>(value: T): Array<T> {
    let a: Array<T> = []
    a.push(value)
    return a
}
</script>
<style lang="scss" scoped></style>
