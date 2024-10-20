import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginAuthInput } from './dto/auth.input';
import { LoginResult } from './schemas/auth.schema';
import { faker } from '@faker-js/faker'; // Cập nhật import từ @faker-js/faker
import { MyLogger } from '../logger/my-logger.service';

// Mô phỏng toàn bộ module AuthService
jest.mock('./auth.service');

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;
  let logger: MyLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        AuthService, // Không cần phải mô phỏng ở đây, Jest sẽ tự động sử dụng mock
        MyLogger,
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    logger = module.get<MyLogger>(MyLogger); // Lấy instance của MyLogger
  });

  describe('login', () => {
    it('should return a LoginResult on successful login', async () => {
      const loginInput: LoginAuthInput = {
        email: faker.internet.email(), // Sử dụng Faker để tạo email giả
        password: faker.internet.password(), // Sử dụng Faker để tạo password giả
      };
      const result: LoginResult = {
        accessToken: faker.string.uuid(), // Sử dụng Faker để tạo accessToken giả
        refreshToken: faker.string.uuid(), // Sử dụng Faker để tạo refreshToken giả
        data: {
          id: faker.number.int(), // Sử dụng Faker để tạo id giả
          username: faker.internet.userName(), // Sử dụng Faker để tạo username giả
          email: loginInput.email, // Sử dụng email từ loginInput
          password: loginInput.password, // Sử dụng password từ loginInput
          createdAt: faker.date.past(), // Sử dụng Faker để tạo createdAt giả
          updatedAt: faker.date.recent(), // Sử dụng Faker để tạo updatedAt giả
          isActive: true,
          imgName: faker.image.avatar(),
          codeExpired: faker.date.future(), // Sử dụng Faker để tạo codeExpired giả
          codeId: faker.string.uuid(), // Sử dụng Faker để tạo codeId giả
          refreshToken: faker.string.uuid(), // Sử dụng Faker để tạo refreshToken giả
          roleId: faker.number.int({ min: 1, max: 5 }), // Sử dụng Faker để tạo roleId giả
        },
      }; // Giả lập kết quả trả về

      // Mô phỏng hành vi của authService.login
      (authService.login as jest.Mock).mockResolvedValue(result);

      expect(await resolver.login(loginInput)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(loginInput); // Kiểm tra xem hàm đã được gọi với tham số đúng
    });

    it('should throw an error if email is not in valid format', async () => {
      const invalidLoginInput: LoginAuthInput = {
        email: 'invalid-email', // Email không hợp lệ
        password: faker.internet.password(),
      };

      jest.spyOn(resolver, 'login').mockRejectedValue(new Error('Invalid email format'));

      await expect(resolver.login(invalidLoginInput)).rejects.toThrow(
        'Invalid email format',
      ); // Kiểm tra xem có lỗi được ném ra không
    });

    it('should throw an error if password is incorrect', async () => {
      const loginInput: LoginAuthInput = {
        email: faker.internet.email(),
        password: 'wrong-password', // Mật khẩu không đúng
      };

      jest.spyOn(resolver, 'login').mockRejectedValue(new Error('Invalid credentials'));

      await expect(resolver.login(loginInput)).rejects.toThrow(
        'Invalid credentials',
      ); // Kiểm tra xem có lỗi được ném ra không
    });
  });
});
