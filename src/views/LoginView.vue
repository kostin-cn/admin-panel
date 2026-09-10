<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

import { useAuthActions } from '@/composables/useAuthActions';
import type { AuthCredentials } from '@/types';

const { isSubmitting, login } = useAuthActions();

const validationSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'Введіть email').email('Введіть коректний email'),
    password: z.string().min(1, 'Введіть пароль').min(4, 'Пароль має бути не менше 4 символів'),
  })
);

const { defineField, handleSubmit, errors } = useForm<AuthCredentials>({
  validationSchema,
  initialValues: {
    email: 'admin@demo.com',
    password: 'password123',
  },
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit((values: AuthCredentials) => {
  login(values);
});
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <Card style="width: 28rem">
      <template #title>
        <div class="text-center">
          <h2 class="text-2xl font-bold m-0">Вхід в адмін-панель</h2>
          <p class="text-sm text-color-secondary mt-1 mb-0">Блог адміністрування</p>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="onSubmit" class="flex flex-column gap-3">
          <div class="flex flex-column gap-1">
            <label for="email" class="font-semibold text-sm">Email</label>
            <InputText
              id="email"
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="admin@demo.com"
              :invalid="!!errors.email"
              fluid
            />
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>

          <div class="flex flex-column gap-1">
            <label for="password" class="font-semibold text-sm">Пароль</label>
            <Password
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              placeholder="••••••••"
              :feedback="false"
              toggleMask
              :invalid="!!errors.password"
              fluid
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <Button
            type="submit"
            label="Увійти"
            icon="pi pi-sign-in"
            :loading="isSubmitting"
            fluid
            class="mt-2"
          />
        </form>

        <div class="mt-4 p-3 surface-100 border-round text-sm">
          <div class="font-semibold mb-1">Тестові акаунти:</div>
          <div><strong>Admin:</strong> admin@demo.com</div>
          <div><strong>Manager:</strong> manager@demo.com</div>
        </div>
      </template>
    </Card>
  </div>
</template>
